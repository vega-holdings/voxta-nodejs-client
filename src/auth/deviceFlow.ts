export type DeviceFlowScope = 'role:app' | 'role:provider' | 'role:inspector';

export interface DeviceCodeResult {
  userCode: string;
  verificationUrl: string;
  deviceCode: string;
}

export interface RequestDeviceCodeOptions {
  baseUrl: string;
  scope?: DeviceFlowScope;
  label?: string;
  clientId?: string;
  signal?: AbortSignal;
}

export async function requestDeviceCode(
  options: RequestDeviceCodeOptions,
): Promise<DeviceCodeResult> {
  const { baseUrl, scope = 'role:app', label, clientId = 'voxta', signal } = options;

  const url = new URL('/api/device/code', baseUrl);
  const body: Record<string, unknown> = {
    client_id: clientId,
    scope,
  };
  if (label) body.label = label;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Voxta device code request failed (${response.status}): ${text || response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    user_code: string;
    verification_url: string;
    device_code: string;
  };

  return {
    userCode: data.user_code,
    verificationUrl: data.verification_url,
    deviceCode: data.device_code,
  };
}

export interface PollDeviceTokenOptions {
  baseUrl: string;
  deviceCode: string;
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function pollDeviceToken(options: PollDeviceTokenOptions): Promise<string> {
  const { baseUrl, deviceCode, intervalMs = 2_000, timeoutMs = 5 * 60_000, signal } = options;

  const url = new URL('/api/device/poll', baseUrl);
  const started = Date.now();

  while (true) {
    if (signal?.aborted) throw (signal.reason ?? new Error('Aborted')) as Error;
    if (timeoutMs > 0 && Date.now() - started > timeoutMs) {
      throw new Error('Timed out waiting for Voxta device token');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_code: deviceCode }),
      signal,
    });

    if (response.status === 204) {
      await new Promise((r) => setTimeout(r, intervalMs));
      continue;
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Voxta token poll failed (${response.status}): ${text || response.statusText}`,
      );
    }

    const data = (await response.json()) as { token?: string | null };
    if (!data.token) {
      await new Promise((r) => setTimeout(r, intervalMs));
      continue;
    }

    return data.token;
  }
}
