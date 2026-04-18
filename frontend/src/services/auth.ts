import type { LoginPayload, RegisterPayload } from "../types/auth";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function submitLogin(_payload: LoginPayload): Promise<void> {
  // TODO: Inlocuieste cu apel backend: POST /auth/login
  await wait(500);
}

export async function submitRegister(_payload: RegisterPayload): Promise<void> {
  // TODO: Inlocuieste cu apel backend: POST /auth/register
  await wait(500);
}
