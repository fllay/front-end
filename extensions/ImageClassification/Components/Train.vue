<template>
  <div style="height: 100vh; width: 100vw">
    <b-input-group class="train-panel">
      <b-input-group-prepend>
        <b-button class="btn-create" variant="primary" @click="openColab"
          >Create</b-button
        >
      </b-input-group-prepend>
      <b-form-input
        :value="currentDevice == 'ROBOT' ? serverUrl : url"
        @change="connectServer"
        placeholder="Put Google Colab URL here . . ."
      ></b-form-input>
      <b-input-group-append>
        <b-button
          class="btn train-btn"
          :variant="isTraining ? 'danger' : 'primary'"
          :disabled="!isConnected || isTerminating"
          @click="handleTrain()"
        >
          <b-spinner v-if="isTerminating" small></b-spinner>
          <b-spinner v-else-if="isTraining" small type="grow"></b-spinner>
          {{ isTraining ? "Terminate" : "Train" }}
        </b-button>
        <b-button
          class="btn base-btn"
          v-b-modal.inference
          :disabled="!isTrained"
        >
          Test
        </b-button>
        <b-button
          :disabled="!isTrained || isConverting || isDownloading"
          class="btn base-btn"
          @click="downloadModel"
        >
          <b-spinner v-if="isConverting || isDownloading" small></b-spinner>
          {{
            isConverting
              ? "Converting..."
              : isDownloading
              ? "Download..."
              : currentDevice == "ROBOT"
              ? "Convert"
              : "Download"
          }}
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <multipane layout="horizontal" class="horizontal-panes multplane">
      <div
        class="test"
        :style="{ height: '70%', maxHeight: '90%', minHeight: '10%' }"
        @mousedown.stop
      >
        <MLModelDesigner></MLModelDesigner>
      </div>
      <multipane-resizer></multipane-resizer>
      <div :style="{ display: 'flex', flexGrow: 1, width: '100%' }">
        <server-report></server-report>
      </div>
    </multipane>
    <sync-project-modal></sync-project-modal>
    <inference-modal></inference-modal>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import { Multipane, MultipaneResizer } from "vue-multipane";
import MLModelDesigner from "~/components/MLModelDesign.vue";
import SyncProjectModal from "~/components/Modals/SyncProjectModal.vue";
import ServerReport from "~/components/ServerReport.vue";
import InferenceModal from "../Modals/InferenceModal.vue";
import axios from "axios";

export default {
  name: "Train",
  components: {
    Multipane,
    MultipaneResizer,
    SyncProjectModal,
    MLModelDesigner,
    ServerReport,
    InferenceModal,
  },
  props: {},
  data() {
    return {
      file: null,
      isDownloading: false,
    };
  },
  methods: {
    ...mapMutations("server", ["setURL", "setTrained"]),
    ...mapMutations("project", [
      "savePretrained",
      "saveTfjs",
      "saveEdgeTPU",
      "saveLabelFile",
    ]),
    ...mapActions("server", ["connect", "convert_model"]),
    ...mapActions("dataset", ["addBlobToFs", "exists"]),
    openColab: () => {
      window.open(
        "https://colab.research.google.com/drive/11t5yJUNjLZwAb_926Izrw2NrqhWIZzZX",
        "_blank"
      );
    },
    downloadFile: async function (url) {
      try {
        let tempFile = await axios.get(url, {
          responseType: "blob",
        });
        if (tempFile.status == 200) {
          return tempFile.data;
        }
      } catch (err) {
        console.log("Failed to download : ", url);
        console.log(err);
        throw "Fail to download : " + url;
      }
    },
    downloadAndSave: async function (url, filename) {
      let file = await this.downloadFile(url);
      if (file) {
        await this.addBlobToFs({
          data: file,
          filename: filename,
        });
      }
    },
    downloadTfjs: async function (projectId) {
      let tfjsModelBasePath = `${this.url}/projects/${projectId}/output/tfjs`;
      let modelJson = await axios.get(`${tfjsModelBasePath}/model.json`);
      if (
        modelJson.status == 200 &&
        modelJson.data.weightsManifest &&
        modelJson.data.weightsManifest.length == 1
      ) {
        for (let binFile of modelJson.data.weightsManifest[0].paths) {
          await this.downloadAndSave(
            `${tfjsModelBasePath}/${binFile}`,
            binFile
          );
        }
      }
      await this.downloadAndSave(
        `${tfjsModelBasePath}/model.json`,
        "model.json"
      );
      let modelEntry = await this.exists(`${projectId}/model.json`);
      if (modelEntry.isFile === true) {
        this.saveTfjs(this.getBaseURL + "/model.json");
      }
    },
    downloadModel: async function () {
      let res = await this.convert_model();
      this.isDownloading = true;
      //this.$toast.success("Convert Model Finished!");
      if (res && this.currentDevice == "BROWSER") {
        try {
          let projectId = this.$store.state.project.project.id;
          //============= download label =============//
          await this.downloadAndSave(
            `${this.url}/projects/${projectId}/output/labels.txt`,
            "labels.txt"
          );
          let labelFileEntry = await this.exists(`${projectId}/labels.txt`);
          if (labelFileEntry.isFile === true) {
            this.saveLabelFile(this.getBaseURL + "/labels.txt");
          }
          //============= download tfjs ==============//
          await this.downloadTfjs(projectId);
          //============= download h5 model ============//
          await this.downloadAndSave(
            `${this.url}/projects/${projectId}/output/Classifier_best_val_accuracy.h5`,
            "model.h5"
          );
          let modelH5Entry = await this.exists(`${projectId}/model.h5`);
          if (modelH5Entry.isFile === true) {
            this.savePretrained(this.getBaseURL + "/model.h5");
          }
          //============= download edgetpu =============//
          await this.downloadAndSave(
            `${this.url}/projects/${projectId}/output/Classifier_best_val_accuracy_edgetpu.tflite`,
            "model_edgetpu.tflite"
          );
          let modelEdgeEntry = await this.exists(
            `${projectId}/model_edgetpu.tflite`
          );
          if (modelEdgeEntry.isFile === true) {
            this.saveEdgeTPU(this.getBaseURL + "/model_edgetpu.tflite");
          }
          this.$toast.success(
            "All model saved to project, save project to download all files"
          );
        } catch (err) {
          console.log("download model failed : ", err);
          this.$toast.error(err.message);
        }
        // window.open(
        //   `${this.url}/download_model?project_id=${projectId}`,
        //   "_blank"
        // );
      } else if (
        res &&
        this.currentDevice == "ROBOT" &&
        !this.url.startsWith(this.serverUrl)
      ) {
        let serverDownloadModel = await axios.post(
          `${this.serverUrl}/download_server_project`,
          {
            project_id: projectId,
            url: this.url,
          }
        );
      }
      this.isDownloading = false;
    },
    connectServer: function (url) {
      console.log("connect server");
      const regex = new RegExp(
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
      );
      if (url != "" || regex.test(url)) {
        console.log("set url to ", url);
        this.setURL(url);
        this.connect();
        this.setTrained(false);
      }
    },
    handleTrain: async function () {
      if (this.isTraining) {
        await this.$store.dispatch("server/terminate");
      } else {
        await this.$store.dispatch("server/train");
      }
    },
    handleInference: function () {},
  },
  directives: {},
  created() {
    //console.log("created");
  },
  mounted() {
    if (this.currentDevice == "ROBOT") {
      this.connectServer(this.serverUrl);
    }
  },
  updated() {},
  computed: {
    ...mapGetters("dataset", ["projectName", "getBaseURL", "getFileExt"]),
    ...mapState(["currentDevice", "serverUrl"]),
    ...mapState("server", [
      "url",
      "isConnected",
      "isTraining",
      "isTerminating",
      "isTrained",
      "isConverting",
      "isConverted",
    ]),
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
.horizontal-panes {
  width: 100%;
  height: calc(100vh - 80px);
  border: 1px solid #ccc;
  overflow: hidden;
}
.multipane.horizontal-panes.layout-h .multipane-resizer {
  margin: 0;
  top: 0; /* reset default styling */
  height: 5px;
  background: #aaa;
}
.train-panel {
  padding: 20px;
  background: #222;
  height: 78px;
  display: flex;
  justify-content: flex-end;
}
.train-btn {
  color: white;
  margin-left: 10px !important;
  border-radius: 15px !important;
  width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
.base-btn {
  color: white;
  background-color: $primary-color;
  margin-left: 10px !important;
  border-radius: 15px !important;
  width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
</style>