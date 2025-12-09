import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import defaultAvatar from '@/assets/default-avatar.png';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          console.error('Supabase not configured');
          toast({
            title: 'Configuration Error',
            description: 'OAuth authentication is not configured.',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: 'Authentication failed',
            description: error.message,
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        if (session) {
          const user = session.user;
          
          // Check if user exists in your database, if not create them
          try {
            const response = await fetch('http://localhost:5000/api/users/oauth-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
                profile_pic: user.user_metadata?.avatar_url || user.user_metadata?.picture || defaultAvatar,
                provider: user.app_metadata?.provider || 'oauth',
              }),
            });

            const data = await response.json();

            if (response.ok) {
              // Set auth state
              setAuth({
                id: data.user.id,
                email: data.user.email,
                name: data.user.full_name,
                bio: data.user.bio || '',
                profilePic: data.user.profile_pic || defaultAvatar,
                location: data.user.location || 'Not specified',
              });

              toast({
                title: 'Login successful!',
                description: `Welcome, ${data.user.full_name}`,
              });

              navigate('/');
            } else {
              throw new Error(data.error || 'Failed to sync user data');
            }
          } catch (syncError) {
            console.error('Error syncing OAuth user:', syncError);
            // Still set auth with available data
            setAuth({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
              bio: '',
              profilePic: user.user_metadata?.avatar_url || user.user_metadata?.picture || defaultAvatar,
              location: 'Not specified',
            });

            toast({
              title: 'Login successful!',
              description: 'Welcome back',
            });

            navigate('/');
          }
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        toast({
          title: 'Authentication error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
