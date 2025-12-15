/**
 * Project State Machine Service
 * Manages project lifecycle transitions between LIVE, ENDED_SUCCESS, and ENDED_FAILED
 * 
 * States:
 * - LIVE: Project is accepting pledges (before deadline)
 * - ENDED_SUCCESS: Project deadline passed AND funding goal reached
 * - ENDED_FAILED: Project deadline passed AND funding goal NOT reached
 */

import { supabase } from "../config/supabaseClient.js";

export const ProjectStatus = {
  LIVE: 'LIVE',
  ENDED_SUCCESS: 'ENDED_SUCCESS',
  ENDED_FAILED: 'ENDED_FAILED'
};

class ProjectStateMachine {
  /**
   * Evaluate and update project status based on deadline and funding
   * Uses lazy evaluation - called when project is accessed
   */
  async evaluateAndUpdateStatus(projectId) {
    try {
      // Fetch project with current status
      const { data: project, error: projectError } = await supabase
        .from('main_projects')
        .select('id, status, funding_goal, funding_deadline')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        console.error('Failed to fetch project for status evaluation:', projectError);
        return null;
      }

      // If already ended, no need to re-evaluate
      if (project.status === ProjectStatus.ENDED_SUCCESS || project.status === ProjectStatus.ENDED_FAILED) {
        return project.status;
      }

      // Check if deadline has passed
      const now = new Date();
      const deadline = project.funding_deadline ? new Date(project.funding_deadline) : null;
      
      if (!deadline || deadline > now) {
        // Still LIVE - no deadline or deadline hasn't passed yet
        return ProjectStatus.LIVE;
      }

      // Deadline has passed - calculate total funding
      const { data: pledges, error: pledgesError } = await supabase
        .from('pledges')
        .select('amount')
        .eq('project_id', projectId)
        .eq('status', 'paid');

      if (pledgesError) {
        console.error('Failed to fetch pledges for status evaluation:', pledgesError);
        return project.status;
      }

      const totalFunding = pledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0);
      const fundingGoal = Number(project.funding_goal || 0);

      // Determine new status
      const newStatus = totalFunding >= fundingGoal 
        ? ProjectStatus.ENDED_SUCCESS 
        : ProjectStatus.ENDED_FAILED;

      // Only update if status has changed
      if (newStatus !== project.status) {
        const { error: updateError } = await supabase
          .from('main_projects')
          .update({ status: newStatus })
          .eq('id', projectId);

        if (updateError) {
          console.error('Failed to update project status:', updateError);
          return project.status;
        }

        console.log(`✅ Project ${projectId} status updated: ${project.status} → ${newStatus}`);
        
        // Handle state-specific actions
        await this.handleStateTransition(projectId, newStatus, totalFunding, fundingGoal);
      }

      return newStatus;
    } catch (err) {
      console.error('Error in evaluateAndUpdateStatus:', err);
      return null;
    }
  }

  /**
   * Handle actions when transitioning to a new state
   */
  async handleStateTransition(projectId, newStatus, totalFunding, fundingGoal) {
    try {
      // Get project details for notifications
      const { data: project } = await supabase
        .from('main_projects')
        .select('title, user_id')
        .eq('id', projectId)
        .single();

      if (!project) return;

      if (newStatus === ProjectStatus.ENDED_SUCCESS) {
        // Project succeeded - notify creator
        await this.notifyProjectSuccess(project, totalFunding, fundingGoal);
        console.log(`🎉 Project "${project.title}" successfully funded!`);
      } else if (newStatus === ProjectStatus.ENDED_FAILED) {
        // Project failed - notify creator and potentially handle refunds
        await this.notifyProjectFailure(project, totalFunding, fundingGoal);
        console.log(`❌ Project "${project.title}" did not reach funding goal.`);
      }
    } catch (err) {
      console.error('Error handling state transition:', err);
    }
  }

  /**
   * Notify creator about successful project completion
   */
  async notifyProjectSuccess(project, totalFunding, fundingGoal) {
    try {
      await supabase.from('notifications').insert([{
        receiver_id: project.user_id,
        project_id: project.id,
        type: 'project_success',
        message: `🎉 Congratulations! Your project "${project.title}" has successfully reached its funding goal of $${fundingGoal}! Total raised: $${totalFunding}`,
        metadata: {
          totalFunding,
          fundingGoal,
          status: ProjectStatus.ENDED_SUCCESS
        }
      }]);
    } catch (err) {
      console.error('Failed to send success notification:', err);
    }
  }

  /**
   * Notify creator about project failure
   */
  async notifyProjectFailure(project, totalFunding, fundingGoal) {
    try {
      await supabase.from('notifications').insert([{
        receiver_id: project.user_id,
        project_id: project.id,
        type: 'project_failed',
        message: `Your project "${project.title}" has ended without reaching its funding goal. Goal: $${fundingGoal}, Raised: $${totalFunding}`,
        metadata: {
          totalFunding,
          fundingGoal,
          status: ProjectStatus.ENDED_FAILED
        }
      }]);
    } catch (err) {
      console.error('Failed to send failure notification:', err);
    }
  }

  /**
   * Check if a project can accept new pledges
   */
  async canAcceptPledges(projectId) {
    const status = await this.evaluateAndUpdateStatus(projectId);
    return status === ProjectStatus.LIVE;
  }

  /**
   * Get project status with lazy evaluation
   */
  async getProjectStatus(projectId) {
    return await this.evaluateAndUpdateStatus(projectId);
  }

  /**
   * Batch update all projects that need status evaluation
   * Can be called periodically or on-demand
   */
  async batchUpdateProjectStatuses() {
    try {
      // Get all LIVE projects
      const { data: projects, error } = await supabase
        .from('main_projects')
        .select('id, funding_deadline')
        .eq('status', ProjectStatus.LIVE);

      if (error || !projects) {
        console.error('Failed to fetch projects for batch update:', error);
        return;
      }

      const now = new Date();
      let updated = 0;

      // Filter projects with passed deadlines
      const expiredProjects = projects.filter(p => {
        if (!p.funding_deadline) return false;
        const deadline = new Date(p.funding_deadline);
        return deadline <= now;
      });

      console.log(`📊 Found ${expiredProjects.length} projects with passed deadlines`);

      // Update each expired project
      for (const project of expiredProjects) {
        await this.evaluateAndUpdateStatus(project.id);
        updated++;
      }

      console.log(`✅ Batch update complete: ${updated} projects evaluated`);
      return { total: projects.length, evaluated: expiredProjects.length, updated };
    } catch (err) {
      console.error('Error in batchUpdateProjectStatuses:', err);
      return null;
    }
  }
}

// Export singleton instance
export const projectStateMachine = new ProjectStateMachine();

// Export class for testing
export default ProjectStateMachine;
