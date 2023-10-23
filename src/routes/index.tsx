import { getAuth, signOut } from "firebase/auth";
import { addDoc, getDoc, doc, updateDoc, collection, collectionGroup, DocumentData, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { A, useNavigate } from "solid-start";
import Counter from "~/components/Counter";
import { SigInput } from "~/components/input";
import { _addRoom, _addUserToRoom } from "~/utils/rooms";

export default function Home() {
  const navigate = useNavigate()

  const [newRoom, setNewRoom] = createSignal('')

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const user = useAuth(getAuth(app))
  const rooms = useFirestore(collection(db, 'rooms'))

  createEffect(function routeGuard() {
    if (user.loading || user.error) return
    if (!user.data?.uid) navigate('/login')
  })

  const addRoom = async () => {
    if (user.data?.uid && newRoom()) {
      const id = await _addRoom(user.data, db, newRoom())
      setNewRoom('')
      navigate(`room/${id}`)
    }
  }

  return (
    <Switch>
      <Match when={rooms.data}>
        {rooms.data?.length && <div class="flex flex-col items-start">
          <For each={rooms.data}>{(x) => <RoomDisplay room={x} user={user} />}</For>
        </div>}
        {user.data?.uid && <div class="flex gap-2">
          <input
            class="input text-white input-bordered w-52"
            placeholder="room name"
            type="text"
            value={newRoom()}
            onInput={(e) => setNewRoom(e.currentTarget.value)}
          />
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
  );
}

type RoomDisplayProps = {
  room: DocumentData,
  user: ReturnType<typeof useAuth>
}

function RoomDisplay(props: RoomDisplayProps) {
  const navigate = useNavigate()

  const app = useFirebaseApp()
  const db = getFirestore(app)
  const user = useAuth(getAuth(app))

  const addUserToRoom = async (id: string) => {
    if (user.data) {
      _addUserToRoom(user.data, db, id)
    }
  }

  const goToRoom = (id: string) => async () => {
    if (!props.user.data?.uid) return
    await addUserToRoom(id)
    navigate(`/room/${id}`)
  }

  return <div class="flex gap-4 items-center">
    <button
      class={'btn'}
      classList={{
        glass: !!props.user.data?.uid,
        'hover:cursor-default hover:border-base-200 hover:bg-base-200': !props.user.data?.uid
      }}
      onClick={goToRoom(props.room?.id)}
    >
      {props.room?.name}
    </button>
    <div class="avatar-group -space-x-6 !overflow-visible">
      {Object.keys(props.room.users).map(x =>
        <div class="tooltip" data-tip={x.split("_")[0]}>
          <div class="avatar placeholder bg-base-300">
            <div class="w-12">
              <span>{x.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
}
