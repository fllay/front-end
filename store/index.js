import JSZip from "jszip";
import axios from "axios";

const robotIp =
  location.hostname === "192.168.2.1" ||
  location.hostname === "localhost" ||
  location.hostname.startsWith("192.168.") ||
  location.hostname.startsWith("10.0.");

export const state = () => ({
  initialDevice: robotIp ? "ROBOT" : "BROWSER",
  currentDevice: robotIp ? "ROBOT" : "BROWSER", //BROWSER, ROBOT , should auto detect
  serverUrl: "http://192.168.1.101:5000/",
  streamUrl: "http://192.168.1.101:8080/stream",
  currentWifi: null,
  isRunning: false,
  selectedMenu: 0,
  //----- save project ------//
  saving: false,
  savingProgress: 0,
  //----- open project ------//
  // opening: false,
  // openingProgress: 0,
});
//---- modal id ----//
//new-project-modal
//open-project-modal
//delete-project-modal
export const mutations = {
  setDevice(state, device) {
    state.currentDevice = device;
  },
  setMenu(state, menu) {
    state.selectedMenu = menu;
  },
  setSaving(state, data) {
    state.saving = data;
  },
  setSavingProgress(state, progress) {
    state.savingProgress = progress;
  },
  setCurrentWifi(state, wifi) {
    state.currentWifi = wifi;
  },
};

export const actions = {
  async changeDevice(context, deviceType) {
    //do something
    context.commit("setDevice", deviceType);
  },
  async getCurrentWifi({ state, commit }) {
    try {
      const res = await axios.get(state.serverUrl + "/wifi_current");
      if (res && res.data.result && res.data.result == "OK") {
        console.log("current wifi = ");
        console.log(res.data.data);
        if (Object.keys(res.data.data).length != 0) {
          commit("setCurrentWifi", res.data.data);
        } else {
          commit("setCurrentWifi", null);
        }
      }
    } catch (err) {
      console.log("load wifi failed ", err);
    }
  },
  async connectWifi(context, name) {
    //context.commit("setWiFi", name);
    //context.commit("setConnectWifiModal", false);
  },
  async saveProject({ commit, dispatch, state, rootState }) {
    commit("setSaving", true);
    commit("setSavingProgress", 0);
    let that = this;
    if (state.currentDevice == "BROWSER") {
      let zip = new JSZip();
      zip.file("project.json", JSON.stringify(rootState));
      //---------- save dataset raw ------------//
      let rawDataset = zip.folder("raw_dataset");
      let datasets = rootState.dataset.dataset.data;
      for (let [i, data] of datasets.entries()) {
        let filename = data.id + "." + data.ext;
        let fileData = await dispatch("dataset/getDataAsFile", filename);
        rawDataset.file(filename, fileData);
        if (rootState.project.project.projectType === "VOICE_CLASSIFICATION") {
          let wavFile = data.id + "." + data.sound_ext;
          let wavData = await dispatch("dataset/getDataAsFile", wavFile);
          rawDataset.file(wavFile, wavData);
          let mfccFile = data.id + "_mfcc.jpg";
          let mfccData = await dispatch("dataset/getDataAsFile", mfccFile);
          rawDataset.file(mfccFile, mfccData);
        }
        let progress = ((i + 1) / datasets.length) * 100;
        commit("setSavingProgress", progress);
      }
      //---------- save output (model) ---------//
      zip
        .generateAsync({
          type: "blob",
          compression: "STORE",
        })
        .then(function (content) {
          that.$helper.downloadBlob("project.zip", content);
        })
        .finally(() => {
          commit("setSaving", false);
        });
    } else if (state.currentDevice == "ROBOT") {
      //sync project instead
    }
  },
  // async openProject(
  //   { commit, dispatch, state, rootState },
  //   { project, files }
  // ) {
  //   commit("setOpening", true);
  //   commit("setOpeningProgress", 0);
  //   let that = this;
  //   if (state.currentDevice == "BROWSER") {
  //     commit("restoreState", projectState);
  //   } else if (state.currentDevice == "ROBOT") {
  //     //TODO : implement here
  //   }
  // },
};
