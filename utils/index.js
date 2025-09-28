const submitPrompt = async (url, context) => {
    try {

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "mistral:latest",
          messages: [
            {
              role: "system",
              content: "You are Randy Marsh from South Park. You are a geologist and towns-people depend on your predictions over reallife binary situations, such as: Will it rain tonight? You are expected to keep the humor and somewhat intelligence of Randy Marsh and give your thought/prediction over the shared situation."
            }, 
            {
              role: 'user', content: "Prediction: " + context
            }
          ],
          stream: false,
      })
    });
            
    const result = await response?.json();

    console.log(result.message.content);

    return result.message.content;

  } catch (error) {
    console.error("Error submitting chat:", error);
    throw new Error("Failed to submit chat. Please try again later.");
  }
}