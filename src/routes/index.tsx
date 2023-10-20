import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, collectionGroup, DocumentData, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { A, useNavigate } from "solid-start";
import Counter from "~/components/Counter";
import Input from "~/components/input";

export default function Home() {
  const navigate = useNavigate()

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const user = useAuth(getAuth(app))

  createEffect(function routeGuard(){
    if (user.loading) return 
    if (!user.data?.uid) navigate('/login')
  })

  const rooms = useFirestore(collection(db, 'rooms'))

  const [newRoom, setNewRoom] = createSignal('')

  const addRoom = () => {
    addDoc(collection(db, 'rooms'), { name: newRoom() })
  }

  return (
    <main class="flex flex-col">
      <Switch>
        <Match when={rooms.data}>
          <div class="flex flex-col items-start">
            <For each={rooms.data}>{
              (x) => <RoomDisplay room={x} user={user} />
            }</For>
          </div>

          {user.data?.uid && <div class="flex gap-2">
            <Input sig={newRoom} setSig={setNewRoom}></Input>
            <button class="btn" onClick={addRoom}> add Room</button>
          </div>}
        </Match>
        <Match when={rooms.loading}>
          <span class="loading loading-ring loading-lg"></span>
        </Match>
        <Match when={rooms.error}>
          <div>error: {rooms.error?.name}</div>
        </Match>
      </Switch>
    </main>
  );
}

type RoomDisplayProps = {
  room: DocumentData,
  user: ReturnType<typeof useAuth>
}

function RoomDisplay(props: RoomDisplayProps) {
  const navigate = useNavigate()

  const goToRoom = (id: string) => () => {
    if (!props.user.data?.uid) return
    navigate(`/room/${id}`)
  }

  return <div class="flex gap-4">
    <button class={'btn'} classList={{ glass: !!props.user.data?.uid, 'hover:cursor-default hover:border-base-200 hover:bg-base-200': !props.user.data?.uid }} onClick={goToRoom(props.room?.id)}>{props.room?.name}</button>
  </div>
}
