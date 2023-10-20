import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirebaseApp } from 'solid-firebase';
import { createEffect, createSignal } from 'solid-js';
import { useNavigate } from 'solid-start';
import { Input, SigInput } from "~/components/input";
import { validateEmail } from '~/utils/emailValidation';

export default function Login() {
  const navigate = useNavigate();
  const app = useFirebaseApp()
  const user = useAuth(getAuth(app))

  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')

  const [isSignIn, setIsSignIn] = createSignal<'sign-in'|'sign-up'>('sign-in')

  createEffect(function routeGuard(){
    if (user.loading) return 
    if (user.data?.uid) navigate('/')
  })

  const signIn = () => {
    if (validateEmail(email())) {
      isSignIn() === 'sign-in' 
        ? signInWithEmailAndPassword(getAuth(app), email(), password())
        : createUserWithEmailAndPassword(getAuth(app), email(), password())
    }
  }

  return (
    <main class="flex flex-col gap-4 items-center justify-center h-[80vh]">
      <h1 class="text-6xl text-white">Login</h1>
      <div class="flex flex-col gap-2">
        <SigInput sig={email} setSig={setEmail} type='email' placeholder='email' autocomplete='email' />
        <SigInput sig={password} setSig={setPassword} type='password' placeholder='password' autocomplete='password' />
        <button class="btn" onClick={signIn}>{isSignIn()}</button>
        <button class="btn" onClick={() => setIsSignIn(isSignIn() === 'sign-in' ? 'sign-up': 'sign-in')}>swap</button>
      </div>
    </main>
  );
}
