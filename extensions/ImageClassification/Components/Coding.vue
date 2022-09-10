<template>
  <div class="blockly-module">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel">
        <div class="d-flex flex-fill flex-row" style="background-color: white">
          <blockly-code
            ref="blockly"
            :style="{ width: currentDevice == 'BROWSER' ? '50%' : '100%' }"
            :toolbox="toolbox"
            :blocks="blocks"
            :language="currentDevice == 'BROWSER' ? 'javascript' : 'python'"
          ></blockly-code>
          <simulator-controller
            v-if="currentDevice == 'BROWSER'"
            style="width: 50%"
            ref="simulator"
            :showController="false"
            :captureKey="false"
            :classify="result"
          ></simulator-controller>
        </div>
        <div style="height: 200px; display: flex">
          <div
            style="
              width: 100%;
              height: 100%;
              padding: 5px;
              background-color: black;
            "
            id="terminal"
            ref="terminal"
          ></div>
          <div
            style="
              width: 200px;
              height: 100%;
              text-align: center;
              padding-top: 46px;
              background-color: black;
            "
          >
            <div class="button">
              <button pill v-on:click="handleRun" class="btn-run op-btn">
                <span class="ico">
                  <img
                    v-if="!isRunning"
                    src="~/assets/images/UI/svg/Group 80.svg"
                  />
                  <img v-else src="~/assets/images/UI/svg/Group 82.svg" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import SimulatorController from "~/components/InputConnection/SimulatorController.vue";
import BlocklyCode from "@/components/BlocklyCode.vue";
import Toolbox from "../Blocks/toolbox";
import Blocks from "../Blocks/blocks";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import axios from "axios";

export default {
  name: "BlocklyComponent",
  components: {
    BlocklyCode,
    SimulatorController,
  },
  data() {
    return {
      toolbox: Toolbox,
      blocks: Blocks,
      model: null,
      isRunning: false,
      result: "",
    };
  },
  methods: {
    handleRun() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.run();
      } else {
        this.isRunning = false;
        this.stop();
      }
    },
    async initModel() {
      var modelJson = await axios.get(this.project.tfjs);
      var weights = [];
      let baseModelPath = this.project.tfjs.substring(
        0,
        this.project.tfjs.lastIndexOf("/")
      );
      let downloadPromises = [];
      for (let binFile of modelJson.data.weightsManifest[0].paths) {
        let w = axios.get(baseModelPath + "/" + binFile, {
          responseType: "arraybuffer",
        });
        downloadPromises.push(w);
      }
      let downloadedWeight = await Promise.all(downloadPromises);
      weights = downloadedWeight.map((el) => el.data);
      let weightData = this.$helper.concatenateArrayBuffers(weights);
      this.model = await tf.loadLayersModel(
        tf.io.fromMemory(
          modelJson.data.modelTopology,
          modelJson.data.weightsManifest[0].weights,
          weightData
        )
      );
    },
    async getLabels() {
      const __label_res = await axios.get(this.project.labelFile);
      const __labels_text = __label_res.data;
      let labels = __labels_text
        .replaceAll("\r", "")
        .split("\n")
        .map((el) => el.trim())
        .filter((el) => el);
      console.log(labels);
      return labels;
    },
    run() {
      console.log("run!!!!");
      //========== load tfjs model ===========//
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("1");
      var code = this.project.code;
      var codeAsync = `(async () => {
        this.term.write("Running ...\\r\\n");
        ${code}
        this.isRunning = false;
        this.result = "";
        this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("0");
        this.term.write("\\r\\nFinish\\r\\n");
      })();`;
      console.log(codeAsync);
      try {
        eval(codeAsync);
      } catch (error) {
        console.log(error);
      }
    },
    stop() {
      console.log("stop!!!");
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("0");
    },
  },
  computed: {
    ...mapState("project", ["project"]),
    ...mapState(["currentDevice", "serverUrl", "streamUrl"]),
    ...mapState("server", ["url"]),
  },
  mounted() {
    console.log("mounted");
    this.term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.$refs.terminal);
    this.term.write("$ ");
    fitAddon.fit();
    console.log("model tfjs path : ", this.project.tfjs);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped>
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
}

ul {
  list-style: none;
  padding: 0;
}
.button {
  .btn-run {
    img {
      width: 100px;
    }
  }

  .btn-stop {
    img {
      width: 100px;
    }
  }
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.main-panel {
  width: calc(100% - 300px);
}

.blockly-module {
  display: flex;
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  .blockly {
    height: 100%;
    width: 100%;
  }

  .side-panel {
    padding: 15px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 300px;
    text-align: end;

    .btn-run {
      img {
        width: 100px;
      }
    }

    .btn-stop {
      img {
        width: 100px;
      }
    }

    .display-panel {
      border-radius: 8px;
      background-color: #333;
      overflow: hidden;
      border: #adb5bd solid 1px;

      .display-image {
        img {
          min-height: 180px;
          height: 180px;
          width: 100%;
          object-fit: cover;
        }
      }

      .control {
        background-color: #ffffff;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        text-transform: uppercase;

        .check {
          padding-left: 36px;
          font-size: 0.7rem;
          color: #222222;
          display: flex;
          align-items: center;
        }
      }
    }

    .next {
      height: 50px;
      background: #ffffff 0% 0% no-repeat padding-box;
      border-radius: 38px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin-top: 15px;

      span {
        color: $primary-color;
        font-size: 1.5rem;
        font-weight: 800;

        &.ico {
          position: absolute;
          top: 7px;
          right: 18px;
        }
      }
    }
  }
}
#expanded-camera {
  .result {
    height: 20vh;
    .bg-secondary {
      height: 100%;
    }
  }
  .display-image {
    background-color: #333 !important;
    img.realtime-image {
      width: 100%;
      height: 55vh;
      object-fit: contain;
    }
  }
  .control {
    background-color: #ffffff;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    text-transform: uppercase;

    .check {
      padding-left: 36px;
      font-size: 0.7rem;
      color: #222222;
      display: flex;
      align-items: center;
    }
  }
}
</style>
<style lang="scss" scoped>
button {
  color: unset;
  border: unset;
  background-color: unset;
  text-align: left;
  position: relative;

  &::after {
    position: absolute;
    top: 17px;
    right: 15px;
  }
}

.custom-control-label::before {
  top: 0 !important;
}

.custom-control-label::after {
  top: 2px !important;
}

.custom-control-input:checked ~ .custom-control-label::before {
  color: #333;
  border-color: #333;
  background-color: #333;
}

.train-pgr {
  border: none !important;
}

.scroll-box {
  height: 200px;
  overflow-y: scroll;
  text-align: left;
  padding: 20px !important;
  background-color: #333 !important;
  display: flex;
  flex-direction: column-reverse;
}

//.modal-footer {
//    display: none !important;
//}
</style>