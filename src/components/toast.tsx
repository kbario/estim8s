import { makeTimer } from "@solid-primitives/timer";
import { createSignal, For } from "solid-js";

const [toast, setToast] = createSignal<{ type: 'success' | 'warning' | 'error', message: string }[]>([]);
export const pushToast = (t: ReturnType<typeof toast>[0]) => {
  setToast([...toast(), t])
  makeTimer(() => popToast(), 3000, setTimeout)
}
const popToast = () => {
  const t = toast()
  t.shift()
  setToast([...t])
}

export function Toast() {
  const first3 = () => toast().slice(0, 3)
  const rest = () => toast().slice(3)

  return <div class="toast toast-start lg:toast-center">
    <For each={first3()}>{t => <Alert t={t} />}</For>
    <div class="stack">
      <For each={rest()}>{t => <Alert t={t} />}</For>
    </div>
  </div>
}

const Alert = (props: { t: ReturnType<typeof toast>[0] }) => {

  return <div class="alert"
    classList={{
      "alert-success": props.t.type === 'success',
      "alert-warning": props.t.type === 'warning',
      "alert-error": props.t.type === 'error',
    }}
  >
    <span>{props.t.message}</span>
  </div>
}
