import { debounce } from "@solid-primitives/scheduled";
import { getAuth, User } from "firebase/auth";
import { doc, getFirestore } from "firebase/firestore";
import { useAuth, useFirebaseApp, useFirestore } from "solid-firebase";
import { Accessor, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate, useParams } from "solid-start";
import { a, _deleteRoom, _labels, _leaveRoom, _makeUserName, _reserAllUserScores, _reserUserScores, _updateUserScores } from "~/utils/rooms";

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

  const [showScores, setShowScores] = createSignal(true)

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
  createEffect(function leaveIfRoomIsDeletedOrYourUserHasLeft() {
    if (!room.data?.leadId && !room.loading) {
      navigate('/')
    }
  })

  // const youBecameLead = createMemo((prev) => !prev && (user.data?.uid === room.data?.leadId) && !user.loading && !room.loading, false)
  // createEffect(function notifyWhenYouBecomeLead() {
  //   if(youBecameLead()) pushToast({ type: 'warning', message: "You're now the room lead"})
  // })
  //
  const listSort = ([al]: [string, any], [bl]: [string, any]) => _labels?.indexOf(al) < _labels?.indexOf(bl) ? -1 : 1

  const thisToThat = (scores: { [k: string]: a }) => {
    return Object.entries(scores).map(([l, v]) => {
      return { enabled: v.enabled, hours: v.value.toString(), min: v.min, name: l }
    })
  }

  // const arst = (acc: number, idv: Thing | EnclosedThing) => {
  //   if (isEnclosedThing(idv)) {
  //     acc += idv.data.reduce(arst, 0);
  //   } else {
  //     acc += idv.enabled ? parseFloat(idv.hours) || 0 : 0;
  //   }
  //   return acc;
  // };

  const SEARCH_PARAM_NAME = "D";
  const zxcd = (init: string) => (acc: string, idv: a, idx: number, arr: a[]) => {
    if ((arr.length - 1) === idx) return acc
    acc += idv.enabled
      ? `${init}- ${_labels[idx]}: ${idv.value}${getPlurality(idv.value.toString())} \n`
      : "";
    return acc;
  };

  const getPlurality = (a?: string) => (a === "1" ? "hr" : "hrs");
  const copy = () => {
    const qwer =
      myFactor()?.enabled && myFactor()?.value
        ? `\ntotal: ${mySum()} * ${myFactor()?.value} = **${mySumByFactor()
          }${getPlurality(mySumByFactor()?.toString())}**`.toString()
        : `\ntotal: **${mySum()}${getPlurality(
          mySum()?.toString()
        )}**`.toString();
    const jkl = `\n\n[Re-estim8 here](https://estim8.kbar.io/?${SEARCH_PARAM_NAME}=${encodeURIComponent(
      JSON.stringify(thisToThat(userScores())),
    )})`;
    const zxcv = Object.values(userScoresLabels()).reduce(zxcd(""), "") + qwer; //+ jkl;
    navigator.clipboard.writeText(zxcv);
  }

  const resetEverything = async () => {
    const ruSure = confirm('do you wish to reset the estimates?')
    if (ruSure) {
      setShowScores(false)
      await _reserAllUserScores(db, params.id, setShowScores)
    }
  }

  const resetMe = async () => {
    const ruSure = confirm('do you wish to reset the estimates?')
    setShowScores(false)
    if (ruSure && user.data) {
      await _reserUserScores(db, params.id, user.data, setShowScores)
    }
  }


  const factor = (thing: { [k: string]: a }) => {
    if (!thing) return undefined;
    return thing?.['Confidence Level']
  }

  const sum = (thing: { [k: string]: a }) => {
    if (!thing) return 0;
    const { ['Confidence Level']: arst, ...rest } = thing
    return Object.values(rest).reduce((acc, idv) => {
      acc += (idv.enabled ? parseFloat(idv.value.toString()) : 0)
      return acc
    }, 0)
  }

  const makeLabels = (a: any) => _labels.map(l => a?.[l])

  // const sumByFactor = () => factor()?.enabled ? factor()?.value * sum() : sum()
  const userScores = createMemo((): { [k: string]: a } => user.data?.uid ? room.data?.users[_makeUserName(user.data)] : {})
  const userScoresLabels = createMemo(() => makeLabels(userScores()))
  // const userScores = createMemo((): [string, a][] =>
  //   !user.loading && !room.loading && user.data?.uid && room.data?.leadId && room.data?.users[_makeUserName(user.data)]
  //     ? Object.entries()
  //       ?.sort(listSort) as [string, a][]
  //     : []) as Accessor<[string, a][]>
  const mySum = createMemo(() => sum(userScores()))
  const myFactor = createMemo(() => factor(userScores()))
  const mySumByFactor = createMemo(() => myFactor()?.enabled ? Math.ceil((mySum()) * parseFloat((myFactor()?.value || '1'))) : mySum())
  const otherUserScores = createMemo(() => {
    if (!!user.data?.uid && room.data?.users) {
      const { [_makeUserName(user.data)]: omitted, ...others } = room.data.users
      return others ? Object.entries(others) : []
    }
    return room.data?.users ? Object.entries(room.data?.users) : []
  }) as Accessor<[string, { [k: string]: a }][]>
  //#endregion derived state

  return <div class="flex flex-col gap-4 max-h-full min-h-max w-full">
    <Show when={room.data && !room.loading}
      fallback={
        <span class="loading loading-ring loading-lg"></span>
      }
    >
      <h3 class="text-2xl font-bold">{room.data?.name}</h3>
      <div class="w-full h-full overflow-auto">
        <div class="flex gap-8 h-max w-full min-w-max">
          <div class="flex flex-col h-max sticky z-4'0 bg-base-100 left-0">
            <div class="bg-base-100 top-0 sticky z-[45]">{user.data?.displayName}</div>
            <For each={userScoresLabels()}>
              {(l, idx) => <Asdf l={l} user={user.data} db={db} id={params.id} idx={idx()} showscores={showScores()}></Asdf>}
            </For>
          </div>
          <For each={otherUserScores()}>
            {([user, scores], idx) => {
              const entries = Object.entries(scores)?.sort(listSort)
              return <OtherUserScores entries={entries} idx={idx()} name={user.split("_")[0]} />
            }}
          </For>
        </div>
      </div>
      {!room.loading && room.data && <div class="flex gap-6 sticky bottom-0 left-0 z-50 items-end bg-base-100 pt-2">
        <div class="flex flex-col">
          total
          <div class="text-2xl">
            <Show when={myFactor()?.enabled && !isNaN(parseFloat(myFactor()?.value || '0')) && myFactor()?.value}
              fallback={<div class="font-bold">{mySum()}{getPlurality(mySum()?.toString())}</div>}
            >
              <span>{mySum()}</span> * {myFactor()?.value} = <span class="font-bold">
                {mySumByFactor()}{getPlurality(mySumByFactor()?.toString())}
              </span>
            </Show>
          </div>
        </div>
        <div class="gap-1 md:flex hidden">
          <button class="btn" onClick={copy}>Copy</button>
          <button class="btn" onClick={resetMe}>Reset Me</button>
          {/* {(room.data?.leadId === user.data?.uid) && */}
          {/*   <button class="btn" onClick={resetEverything}>Reset Everything</button>} */}
        </div>
      </div>
      }
    </Show>
    <div class="md:flex hidden flex-col gap-1 items-end absolute right-4 z-[60] bottom-4">
      <button onClick={leaveRoom} class="btn">leave room</button>
      {(room.data?.leadId === user.data?.uid) && <button onClick={deleteRoom} class="btn">delete room</button>}
    </div>
    <div class="flex md:hidden absolute bottom-4 right-4  items-end w-full justify-end">
      <details class="dropdown dropdown-top dropdown-end z-[60]">
        <summary class="btn">
          <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" /></svg>
        </summary>
        <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
          <li>
            <button class="btn" onClick={copy}>Copy</button>
          </li>
          <li>
            <button class="btn" onClick={resetMe}>Reset Me</button>
          </li>
          {/* {(room.data?.leadId === user.data?.uid) && <li> */}
          {/*   <button class="btn" onClick={resetEverything}>Reset Everything</button> */}
          {/* </li>} */}
          <li>
            <button onClick={leaveRoom} class="btn">leave room</button>
          </li>
          {(room.data?.leadId === user.data?.uid) && <li>
            <button onClick={deleteRoom} class="btn">delete room</button>
          </li>}
        </ul>
      </details>
    </div>
  </div >
}

const OtherUserScores = (props: { entries: [string, a][], idx: number, name: string }) => {
  const classes = [
    // { main: 'bg-primary text-primary-content', updated: 'bg-primary-focus text-primary-focus-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content opacity-60', updated: 'bg-secondary-focus text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content opacity-60', updated: 'bg-accent-focus text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content opacity-60', updated: 'bg-info-focus text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content opacity-60', updated: 'bg-success-focus text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content opacity-60', updated: 'bg-warning-focus text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content opacity-60', updated: 'bg-error-focus text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content opacity-60', updated: 'bg-primary-focus text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content opacity-60', updated: 'bg-secondary-focus text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content opacity-60', updated: 'bg-accent-focus text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content opacity-60', updated: 'bg-info-focus text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content opacity-60', updated: 'bg-success-focus text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content opacity-60', updated: 'bg-warning-focus text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content opacity-60', updated: 'bg-error-focus text-error-content', second: 'bg-error-content text-error' },
    { main: 'bg-primary text-primary-content opacity-60', updated: 'bg-primary-focus text-primary-content', second: 'bg-primary-content text-primary' },
    { main: 'bg-secondary text-secondary-content opacity-60', updated: 'bg-secondary-focus text-secondary-content', second: 'bg-secondary-content text-secondary' },
    { main: 'bg-accent text-accent-content opacity-60', updated: 'bg-accent-focus text-accent-content', second: 'bg-accent-content text-accent' },
    { main: 'bg-info text-info-content opacity-60', updated: 'bg-info-focus text-info-content', second: 'bg-info-content text-info' },
    { main: 'bg-success text-success-content opacity-60', updated: 'bg-success-focus text-success-content', second: 'bg-success-content text-success' },
    { main: 'bg-warning text-warning-content opacity-60', updated: 'bg-warning-focus text-warning-content', second: 'bg-warning-content text-warning' },
    { main: 'bg-error text-error-content opacity-60', updated: 'bg-error-focus text-error-content', second: 'bg-error-content text-error' },
  ]
  return <div class="flex flex-col items-center h-max">
    <div class="sticky top-0 bg-base-100 z-20 w-full text-center">{props.name}</div>
    <For each={props.entries}>{([_, score]) =>
      <div class="flex items-center justify-center h-16">
        <div class="w-8 aspect-square flex items-center justify-center rounded-full cursor-default"
          classList={{
            [classes[props.idx].main]: score.enabled && !score.updated,
            [classes[props.idx].updated]: score.enabled && score.updated,
            [classes[props.idx].second]: !score.enabled,
          }}
        >
          {score.value}
        </div>
      </div>
    }</For>
  </div>
}

const Asdf = (props: { user: User | null, db, l, id: string, idx: number, showscores: boolean }) => {
  const [mut, setMut] = createSignal<a>({} as a)

  createEffect(function updatedInputsOnReset() {
    (() => props.showscores)()
    setMut(props.l)
  })

  const setMutEnabled = (enabled: boolean) => {
    setMut({ ...mut(), updated: true, enabled })
  }
  const setMutValue = (value: string) => {
    setMut({ ...mut(), updated: true, value })
  }
  const trigger = debounce(async () => {
    props.user &&
      await _updateUserScores(props.user, props.db, props.id, _labels[props.idx], mut())
  }, 500)
  return <div class="flex gap-4 h-16 items-center justify-between">
    <div class="form-control sticky bg-base-100 left-0">
      <label class="label cursor-pointer flex gap-2">
        <input
          class="checkbox"
          type="checkbox"
          checked={mut()?.enabled}
          onChange={(e) => { setMutEnabled(e.target.checked); trigger() }} />
        <span class="label-text">{_labels[props.idx]}</span>
      </label>
    </div>
    <input
      class="input text-white input-bordered w-24"
      classList={{ 'input-primary': mut()?.updated }}
      placeholder="estim8"
      disabled={!mut()?.enabled}
      step={mut()?.step}
      inputmode="decimal"
      type="number"
      value={mut()?.value}
      onInput={(e) => { setMutValue(e.currentTarget.value); trigger() }}
    />
  </div>
}
