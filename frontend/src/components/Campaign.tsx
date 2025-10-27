import { useEffect, useState } from "react";

type CampaignProps = {
  projectId: string;
};

const Campaign = ({ projectId }: CampaignProps) => {
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        console.log("Fetching campaign for projectId (frontend):", projectId);
        const res = await fetch(`http://localhost:5000/api/projects/campaign/${projectId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch campaign data");
        }

        const data = await res.json();
        setDescription(data.description || "");
        setImages(data.image_urls || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
          console.error("Error fetching campaign:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
    return () => controller.abort();
  }, [projectId]);

  if (loading) return <div>Loading campaign...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campaign Story</h2>
      <p>{description}</p>

      {images.length > 0 ? (
        images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Campaign ${idx}`}
            className="w-full rounded-lg"
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No campaign images found.</p>
      )}
    </div>
  );
};

export default Campaign;

