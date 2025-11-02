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

 if (loading) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
      <p className="text-gray-600">Loading campaign...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
      <p className="font-semibold">Error:</p>
      <p>{error}</p>
    </div>
  );
}

  return (
  <div className="space-y-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm">
    <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
      Campaign Story
    </h2>

    <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-line">
      {description || "No campaign description available."}
    </div>

    {images.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-transform hover:scale-[1.02]"
          >
            <img
              src={url}
              alt={`Campaign ${idx}`}
              className="w-full h-64 object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500 italic">No campaign images found.</p>
    )}
  </div>
);

};

export default Campaign;

