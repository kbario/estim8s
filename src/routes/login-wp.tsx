import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useFirebaseApp } from 'solid-firebase';
import { createEffect, createSignal } from 'solid-js';
import { useNavigate } from 'solid-start';
import { Input, SigInput } from "~/components/input";
import { pushToast } from '~/components/toast';
import { validateEmail } from '~/utils/emailValidation';

export default function Login() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const user = useAuth(getAuth(app))

  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')

  const [isSignIn, setIsSignIn] = createSignal<'sign-in' | 'sign-up'>('sign-up')

  createEffect(function routeGuard() {
    if (user.loading) return
    if (user.data?.uid) navigate('/')
  })

  const signIn = () => {
    if (validateEmail(email())) {
      isSignIn() === 'sign-in'
        ? signInWithEmailAndPassword(getAuth(app), email(), password())
          .catch((err:FirebaseError) => { pushToast({ type: 'error', message: err.message }); console.log(err) })
        : createUserWithEmailAndPassword(getAuth(app), email(), password())
          .then(() => {
            pushToast({ type: 'success', message: 'your user was created successfully :)' })
            while (!user.data || user.loading) { }
            updateProfile(user.data, { displayName: user.data.email })
            // .then(() => pushToast({ type: 'success', message: 'display name updated' }))
            // .catch((error) => { pushToast({ type: 'error', message: 'could not update display name' }); console.log(error) })
          })
          .catch((err) => { pushToast({ type: 'error', message: err.message }); console.log(err) })
    }
  }

  return (
    <main class="flex flex-col gap-4 items-center justify-center h-[80vh]">
      <h1 class="text-6xl text-white">Login</h1>
      <div class="flex flex-col gap-2">
        <SigInput sig={email} setSig={setEmail} type='email' placeholder='email' autocomplete='email' />
        <SigInput sig={password} setSig={setPassword} type='password' placeholder='password' autocomplete='password' />
        <button class="btn" onClick={signIn}>{isSignIn()}</button>
        <button class="btn" onClick={() => setIsSignIn(isSignIn() === 'sign-in' ? 'sign-up' : 'sign-in')}>swap</button>
      </div>
    </main>
  );
}

