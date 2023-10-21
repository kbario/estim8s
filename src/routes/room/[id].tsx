import { Navigate, useParams } from "solid-start";
import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, collectionGroup, deleteDoc, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { createEffect, createMemo, createSignal, For } from "solid-js";
import { A, useNavigate } from "solid-start";
import { Input } from "~/components/input";
import { _makeUserName, _deleteRoom, _leaveRoom, _updateUserScores } from "~/utils/rooms";
import { debounce } from "@solid-primitives/scheduled";

const labels = [
  'Communication & Meetings',
  'Initial Setup',
  "Development",
  'Revision/Bug-fixes',
  "writing Tests",
  'Manual Testing',
  "Merging & Deployment",
  "Learning Time/Non-project",
  "Confidence Level"
]

export default function Room() {
  //#region solid
  const params = useParams();
  const navigate = useNavigate()
  //#endregion solid

  //#region firebase
  const app = useFirebaseApp()
  const db = getFirestore(app)
  const auth = getAuth(app)
  const user = useAuth(auth)
  const room = useFirestore(doc(db, 'rooms', params.id))

  const leaveRoom = async () => {
    user.data && await _leaveRoom(user.data, db, params.id)
    navigate('/')
  }
  const deleteRoom = async () => {
    _deleteRoom(db, params.id)
    navigate('/')
  }
  //#endregion firebase

  //#region derived state
  createEffect(function leaveIfRoomIsDeleted() {
    if (!room.data?.leadId && !room.loading) {
      navigate('/')
    }
  })

  const userScores = createMemo(() => user.data?.uid ? room.data?.users[_makeUserName(user.data)] : [])
  const otherUserScores = createMemo(() => {
    if (!!user.data?.uid && room.data?.users) {
      const { [_makeUserName(user.data)]: omitted, ...others } = room.data.users
      return Object.entries(others) //as [string, [{enabled: boolean, value:true}]]
    }
    return room.data?.users ? Object.entries(room.data?.users) : []
  })
  //#endregion derived state

  return <div>
    <h3 class="text-xl ">{room.data?.name}</h3>
    {room.data?.leadName}
    <div class="flex gap-4">
      <div class="flex flex-col">
        {userScores() &&
          <For each={userScores()}>
            {(score, idx) => {
              const mut = JSON.parse(JSON.stringify(score))
              const trigger = debounce(async () => {
                user.data &&
                  await _updateUserScores(user.data, db, params.id, mut, idx())
              })
              return <div class="flex gap-1">
                <div class="form-control">
                  <label class="label cursor-pointer flex gap-2">
                    <input type="checkbox" checked={mut.enabled} onChange={(e) =>  { mut.enabled = e.target.value; trigger()} } class="checkbox" />
                    <span class="label-text">{labels[idx()]}</span>
                  </label>
                </div>
                <Input sig={mut.value} setSig={(v: typeof mut) => {mut.value = v; trigger()}} />
              </div>
            }
            }
          </For>}
      </div>
      <For each={otherUserScores()}>
        {([user, scores], idx) => <div>
          {user.split("_")[0]}
          <For each={scores as { enabled: boolean, value: number }[]}>{(score) =>
            <OtherUserScores enabled={score.enabled} value={score.value} idx={idx()} />
          }</For>
        </div>
        }
      </For>
    </div>
    <div class="flex gap-1 absolute right-4 bottom-4">
      <button onClick={leaveRoom} class="btn">leave room</button>
      {(room.data?.leadId === user.data?.uid) && <button onClick={deleteRoom} class="btn">delete room</button>}
    </div>
  </div>
}

const OtherUserScores = (props: { enabled: boolean, value: number, idx: number }) => {
  const classes = [
    { main: 'bg-primary text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content', second: 'bg-error-content text-error' },
  ]
  return <div class="w-8 aspect-square flex items-center justify-center rounded-full"
    classList={{
      [classes?.[props.idx]?.main]: props.enabled,
      [classes[props.idx].second]: !props.enabled,
    }}
  >
    {props.value}
  </div>
}
