import { getAuth, signOut, updateProfile } from "firebase/auth"
import { useAuth, useFirebaseApp } from "solid-firebase"
import { createEffect, createRenderEffect, createSignal, onMount } from "solid-js";
import { useNavigate } from "solid-start";
import { pushToast } from "~/components/toast";

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

export default function Account() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const state = useAuth(getAuth(app))

  const [displayName, setDisplayName] = createSignal('')

  createEffect(() => {
    if (state.loading) return;
    if (!state.data?.uid) {
      navigate('/login')
    }
    if (state.data?.displayName) setDisplayName(state.data.displayName)
  })

  function updateDisplayName() {
    if (state.data) {
      updateProfile(state.data, { displayName: displayName() })
        .then(() => pushToast({ type: 'success', message: 'display name updated' }))
        .catch((error) => { pushToast({ type: 'error', message: 'could not update display name' }); console.log(error) })
    }
  }

  function logout() {
    signOut(getAuth(app))
      .then(() => pushToast({ type: 'success', message: 'logged out' }))
      .catch((error) => { pushToast({ type: 'error', message: 'could not log you out' }); console.log(error) })
  }

  return <main class="flex flex-col gap-2 items-start">
    {state.data?.email}

    <input use:model={[displayName, setDisplayName]} type="text" placeholder="display name" class="input text-white input-bordered w-full max-w-xs" />

    <button class="btn" onClick={updateDisplayName}>update details</button>

    <button class="btn" onClick={logout}>logout</button>
  </main>
}
