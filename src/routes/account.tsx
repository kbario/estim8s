import { getAuth, signOut, updateProfile } from "firebase/auth"
import { useAuth, useFirebaseApp } from "solid-firebase"
import { createEffect, createRenderEffect, createSignal, onMount } from "solid-js";
import { useNavigate } from "solid-start";

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
    if (!state.data?.uid) navigate('/login')
    if (state.data?.displayName) setDisplayName(state.data.displayName)
  })

  function logout(){
    signOut(getAuth(app))
  }

  return <main class="flex flex-col gap-2 items-start">
    {state.data?.email}

    <input use:model={[displayName, setDisplayName]} type="text" placeholder="display name" class="input text-white input-bordered w-full max-w-xs" />

    <button class="btn" onClick={() => {
      if (state.data) updateProfile(state.data, { displayName: displayName() })
    }}>update details</button>

    <button class="btn" onClick={logout}>logout</button>
  </main>
}
