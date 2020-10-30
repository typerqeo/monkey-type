export const testCompleted = firebase
  .functions()
  .httpsCallable("testCompleted");
export const addTag = firebase.functions().httpsCallable("addTag");
export const editTag = firebase.functions().httpsCallable("editTag");
export const removeTag = firebase.functions().httpsCallable("removeTag");
export const updateResultTags = firebase
  .functions()
  .httpsCallable("updateResultTags");
export const saveConfig = firebase.functions().httpsCallable("saveConfig");
export const generatePairingCode = firebase
  .functions()
  .httpsCallable("generatePairingCode");
export const saveLbMemory = firebase.functions().httpsCallable("saveLbMemory");
export const unlinkDiscord = firebase
  .functions()
  .httpsCallable("unlinkDiscord");
export const verifyUser = firebase.functions().httpsCallable("verifyUser");
export const reserveName = firebase
  .functions()
  .httpsCallable("reserveDisplayName");
