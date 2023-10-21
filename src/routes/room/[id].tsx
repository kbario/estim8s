import { debounce } from "@solid-primitives/scheduled";
import { getAuth } from "firebase/auth";
import { doc, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { Accessor, createEffect, createMemo, For, Show } from "solid-js";
import { useNavigate, useParams } from "solid-start";
import { Input } from "~/components/input";
import { a, _deleteRoom, _labels, _leaveRoom, _makeUserName, _updateUserScores } from "~/utils/rooms";

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

  createEffect(() => console.log(userScores()))

  // const youBecameLead = createMemo((prev) => !prev && (user.data?.uid === room.data?.leadId) && !user.loading && !room.loading, false)
  // createEffect(function notifyWhenYouBecomeLead() {
  //   if(youBecameLead()) pushToast({ type: 'warning', message: "You're now the room lead"})
  // })
  //
  const listSort = ([al]: [string, any], [bl]: [string, any]) => _labels?.indexOf(al) < _labels?.indexOf(bl) ? -1 : 1

  const sum = (thing: [string, a][]) => {
    const idx = thing?.findIndex(([s]) => s === 'Confidence Level')
    if (typeof idx !== 'number' && !idx && idx !== -1) return undefined
    const factor = thing[idx]?.[1]
    const summers = idx ? thing.splice(idx, 1) : thing
    const sum = summers.reduce((acc, [label, idv]) => {
      acc += idv.enabled ? idv.value : 0
      return acc
    }, 0)
    return factor?.enabled ? sum * factor.value : sum
  }

  const userScores = createMemo((): [string, a][] =>
    !user.loading && !room.loading && user.data?.uid && room.data?.leadId && room.data?.users[_makeUserName(user.data)]
      ? Object.entries(room.data?.users[_makeUserName(user.data)])
        ?.sort(listSort) as [string, a][]
      : []) as Accessor<[string, a][]>
  // const mySum = createMemo(() => sum(userScores()))
  const otherUserScores = createMemo(() => {
    if (!!user.data?.uid && room.data?.users) {
      const { [_makeUserName(user.data)]: omitted, ...others } = room.data.users
      return others ? Object.entries(others) : []
    }
    return room.data?.users ? Object.entries(room.data?.users) : []
  }) as Accessor<[string, { [k: string]: a }][]>
  //#endregion derived state

  return <div>
    <h3 class="text-xl ">{room.data?.name}</h3>
    {room.data?.leadName}
    <div class="flex gap-4">
      <div class="flex flex-col">
        {userScores() && <For each={userScores()}>
          {([label, score]) => {
            const mut = JSON.parse(JSON.stringify(score))
            const trigger = debounce(async () => {
              console.log(mut)
              user.data &&
                await _updateUserScores(user.data, db, params.id, label, mut)
            }, 1000)
            return <div class="flex gap-1 justify-between">
              <div class="form-control">
                <label class="label cursor-pointer flex gap-2">
                  <input
                    class="checkbox"
                    type="checkbox"
                    checked={mut.enabled}
                    onChange={(e) => { mut.enabled = e.target.checked; trigger() }} />
                  <span class="label-text">{label}</span>
                </label>
              </div>
              <input
                class="input text-white input-bordered w-24"
                placeholder="estim8"
                type="number"
                pattern="\d*"
                value={mut.value}
                onInput={(e) => { mut.value = e.currentTarget.value; trigger() }}
              />
            </div>
          }}
        </For>}
      </div>
      <For each={otherUserScores()}>
        {([user, scores], idx) => {
          const entries = Object.entries(scores)?.sort(listSort)
          return <OtherUserScores entries={entries} idx={idx()} name={user.split("_")[0]} />
        }}
      </For>
    </div >
    <div class="flex gap-1 absolute right-4 bottom-4">
      <button onClick={leaveRoom} class="btn">leave room</button>
      {(room.data?.leadId === user.data?.uid) && <button onClick={deleteRoom} class="btn">delete room</button>}
    </div>
  </div >
}

const OtherUserScores = (props: { entries: [string, a][], idx: number, name: string }) => {
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
  return <div class="flex flex-col gap-1">
    <div>{props.name}</div>
    <For each={props.entries}>{([_, score]) =>
      <div class="w-8 aspect-square flex items-center justify-center rounded-full"
        classList={{
          [classes[props.idx].main]: score.enabled,
          [classes[props.idx].second]: !score.enabled,
        }}
      >
        {score.value}
      </div>
    }</For>
  </div>
}
