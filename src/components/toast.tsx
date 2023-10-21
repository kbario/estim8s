import { createEffect, createSignal, For, onCleanup } from "solid-js";

const [toast, setToast] = createSignal<{ type: 'success' | 'warning' | 'error', message: string }[]>([]);
export const pushToast = (t: ReturnType<typeof toast>[0]) => setToast([...toast(), t])
const popToast = () => {
  const t = toast()
  t.shift()
  setToast([...t])
}

export function Toast() {
  createEffect(function setToast() {
    let time: NodeJS.Timeout;
    if (toast().length) {
      time = setTimeout(() => { popToast() }, 3000)
    }
    onCleanup(() => clearTimeout(time))
  })

  return <div class="toast toast-center">
    <For each={toast()}>
      {(t) => <div class="alert"
        classList={{
          "alert-success": t.type === 'success',
          "alert-warning": t.type === 'warning',
          "alert-error": t.type === 'error',
        }}
      >
        <span>{t.message}</span>
      </div>}
    </For>
  </div>
}
