import { User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "solid-firebase";

export const _labels = [
  "Communication & Meetings",
  "Initial Setup",
  "Development",
  "Revision/Bug-fixes",
  "Writing Tests",
  "Manual Testing",
  "Merging & Deployment",
  "Learning Time/Non-project",
  "Confidence Level",
]

const labels = [
  { label: "Communication & Meetings", value: 2, min: 1 },
  { label: "Initial Setup", value: 2, min: 1 },
  { label: "Development", value: 4, min: 1 },
  { label: "Revision/Bug-fixes", value: 2, min: 1 },
  { label: "Writing Tests", value: 2, min: 1 },
  { label: "Manual Testing", value: 2, min: 1 },
  { label: "Merging & Deployment", value: 2, min: 1 },
  { label: "Learning Time/Non-project", value: 2, min: 1 },
  { label: "Confidence Level", value: 2, min: 1 },
]

export const _leaveRoom = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  id: string,
): Promise<void> => {
  const docoData = (await getDoc(doc(db, 'rooms', id))).data();
  if (!!user.uid && docoData?.users) {
    const roomHasUser = !!docoData?.users[_makeUserName(user)]
    if (roomHasUser) {
      const { [_makeUserName(user)]: omitted, ...others } = docoData.users
      if (user.uid === docoData.leadId) {
        const newLead = Object.keys(others)[0].split("_")
        await updateDoc(doc(db, 'rooms', id), {
          leadName: newLead[0],
          leadId: newLead[1],
          users: others
        })
      } else {
        await updateDoc(doc(db, 'rooms', id), {
          users: others
        })
      }
    }
  }
}

export const _deleteRoom = async (
  db: ReturnType<typeof getFirestore>,
  id: string,
) => {
  const ruSure = confirm('are you sure?')
  if (ruSure) {
    await deleteDoc(doc(db, 'rooms', id))
  }
}

// function aDefault(value: number, enabled = true) {
//   return {
//     enabled: enabled,
//     value,
//   }
// }
export type a = { enabled: boolean, value: number, min: number }

function defaults() {
  return labels.reduce((acc, idv) => {
    acc[idv.label] = { enabled: true, value: idv.value, min: idv.min }
    return acc
  }, {} as { [k: string]: a })
}

export const _makeUserName = (user: User) => `${user.displayName}_${user.uid}`

export const _addRoom = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  roomName: string,
): Promise<string> => {
  const doco = await addDoc(collection(db, 'rooms'), {
    name: roomName,
    leadId: user.uid,
    leadName: user.displayName,
    users: {
      [_makeUserName(user)]: defaults()
    }
  })
  return (await getDoc(doco)).id
}

export const _addUserToRoom = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  roomId: string,
) => {
  if (user.uid) {
    const doco = await getDoc(doc(db, 'rooms', roomId));
    const docoData = doco.data()
    const userData = docoData?.users[_makeUserName(user)]
    if (!userData) {
      // to populate new users dev list
      // const leadData = docoData?.users[`${docoData?.leadName}_${docoData?.leadId}`].Development
      await updateDoc(doc(db, 'rooms', roomId), {
        users: {
          [_makeUserName(user)]: defaults(),
          ...docoData?.users,
        },
      })
    }
  }
}

export const _updateUserScores = async (
  user: User,
  db: ReturnType<typeof getFirestore>,
  roomId: string,
  label: string,
  value: a
) => {
  if (user.uid) {
    const doco = await getDoc(doc(db, 'rooms', roomId));
    const docoData = doco.data()
    const userName = _makeUserName(user)
    const userData = doco.data()?.users[userName]
    if (!!userData && !!docoData) {
      userData[label] = value
      docoData.users[userName] = userData
      await updateDoc(doc(db, 'rooms', roomId), docoData)
    }
  }
}