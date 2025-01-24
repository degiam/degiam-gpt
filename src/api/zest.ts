type ChatWithAiProps = {
  model: 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'grok-beta' | 'grok-2' | 'grok-2-mini' | 'claude-3-sonnet' | 'blackbox';
  message: {
    messages: {
      role: string;
      content: string;
    }[];
  }
}

export async function chatWithAi(props: ChatWithAiProps): Promise<string> {
  try {
    const response = await fetch(`${import.meta.env.VITE_ZEST_API}/${props.model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(props.message),
    });

    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Gagal mengirim pesan');
    }
  } catch (error: any) {
    throw new Error(`Terjadi kesalahan: ${error.message || 'Tidak diketahui'}`);
  }
}