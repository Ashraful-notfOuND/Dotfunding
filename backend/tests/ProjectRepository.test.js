import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProjectRepository from '../src/repositories/ProjectRepository.js';

// Mock DatabaseClient
const mockClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock('../src/config/DatabaseClient.js', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getClient: () => mockClient,
    })),
  },
}));

describe('ProjectRepository - Repository Pattern', () => {
  let repository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ProjectRepository();
  });

  describe('create', () => {
    it('should create a project successfully', async () => {
      const projectData = {
        user_id: 'user-123',
        title: 'Test Project',
        tagline: 'A test project',
        funding_goal: 10000,
        category: 'Technology',
      };

      const mockResponse = {
        data: {
          id: 'proj-1',
          user_id: 'user-123',
          title: 'Test Project',
          tagline: 'A test project',
          funding_goal: 10000,
          category: 'Technology',
          created_at: new Date().toISOString(),
        },
        error: null,
      };

      mockClient.single.mockResolvedValue(mockResponse);

      const result = await repository.create(projectData);

      expect(result).toHaveProperty('id', 'proj-1');
      expect(result).toHaveProperty('title', 'Test Project');
      expect(result.fundingGoal).toBe(10000);
      expect(mockClient.from).toHaveBeenCalledWith('main_projects');
      expect(mockClient.insert).toHaveBeenCalledWith([projectData]);
    });

    it('should throw error when creation fails', async () => {
      const projectData = {
        user_id: 'user-123',
        title: 'Test Project',
      };

      mockClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.create(projectData)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find project by id', async () => {
      const mockProject = {
        id: 'proj-1',
        user_id: 'user-123',
        title: 'Test Project',
        funding_goal: 10000,
      };

      mockClient.single.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await repository.findById('proj-1');

      expect(result).not.toBeNull();
      expect(result.id).toBe('proj-1');
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'proj-1');
    });

    it('should return null for non-existent project', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error for database errors', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Connection error', code: 'CONN_ERR' },
      });

      await expect(repository.findById('proj-1')).rejects.toThrow('Connection error');
    });
  });

  describe('findAll', () => {
    it('should retrieve all projects', async () => {
      const mockProjects = [
        { id: 'proj-1', title: 'Project 1', user_id: 'user-1', funding_goal: 5000 },
        { id: 'proj-2', title: 'Project 2', user_id: 'user-2', funding_goal: 10000 },
      ];

      mockClient.order.mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('proj-1');
      expect(results[1].fundingGoal).toBe(10000);
    });

    it('should filter projects by category', async () => {
      const mockProjects = [
        { id: 'proj-1', title: 'Tech Project', category: 'Technology', funding_goal: 5000 },
      ];

      mockClient.order.mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      const results = await repository.findAll({ category: 'Technology' });

      expect(mockClient.eq).toHaveBeenCalledWith('category', 'Technology');
      expect(results).toHaveLength(1);
    });

    it('should filter projects by userId', async () => {
      const mockProjects = [
        { id: 'proj-1', user_id: 'user-123', title: 'My Project', funding_goal: 5000 },
      ];

      mockClient.order.mockResolvedValue({
        data: mockProjects,
        error: null,
      });

      await repository.findAll({ userId: 'user-123' });

      expect(mockClient.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        funding_goal: 15000,
      };

      mockClient.single.mockResolvedValue({
        data: {
          id: 'proj-1',
          ...updateData,
          user_id: 'user-123',
        },
        error: null,
      });

      const result = await repository.update('proj-1', updateData);

      expect(result.title).toBe('Updated Title');
      expect(result.fundingGoal).toBe(15000);
      expect(mockClient.update).toHaveBeenCalledWith(updateData);
      expect(mockClient.eq).toHaveBeenCalledWith('id', 'proj-1');
    });

    it('should throw error when update fails', async () => {
      mockClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(repository.update('proj-1', {})).rejects.toThrow('Update failed');
    });
  });

  describe('mapToEntity', () => {
    it('should map database row to entity correctly', () => {
      const dbRow = {
        id: 'proj-1',
        user_id: 'user-123',
        title: 'Test Project',
        tagline: 'Tagline',
        image_url: 'http://example.com/image.jpg',
        funding_goal: '10000',
        funding_deadline: '2025-12-31',
        category: 'Technology',
        location: 'New York',
        created_at: '2025-01-01',
      };

      const entity = repository.mapToEntity(dbRow);

      expect(entity.id).toBe('proj-1');
      expect(entity.userId).toBe('user-123');
      expect(entity.fundingGoal).toBe(10000);
      expect(entity.imageUrl).toBe('http://example.com/image.jpg');
    });

    it('should return null for null input', () => {
      const result = repository.mapToEntity(null);
      expect(result).toBeNull();
    });
  });
});
