export const SaveReport = async (data) => {
  try {
    const response = await fetch(`https://aws-calculator-backend.onrender.com/onSave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save report: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, message: 'Report saved successfully', data: result };
  } catch (error) {
    console.error('Error saving report:', error);
    return { success: false, message: `Failed to save report: ${error.message}` };
  }
};