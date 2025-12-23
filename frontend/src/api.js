const API_BASE_URL = "https://ai-music-backend-g0d9.onrender.com/api";

export const generateSong = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Failed to generate song");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const pollTaskStatus = async (taskId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/status/${taskId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Failed to get task status");
        }

        return await response.json();
    } catch (error) {
        console.error("Polling Error:", error);
        throw error;
    }
};
