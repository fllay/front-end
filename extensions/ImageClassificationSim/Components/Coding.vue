<template>
  <div class="blockly-module">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel">
        <div
          class="d-flex flex-fill flex-column"
          style="background-color: white"
        >
          <div class="row h-100">
            <div class="col-6">
              <div class="blockly" ref="blocklyDiv"></div>
            </div>
            <div class="col-6">
              <iframe
                ref="gameInstance"
                scrolling="no"
                width="100%"
                height="60%"
                src="/VKBuild/index.html"
                frameborder="0"
              />

              <!--<button v-on:click="onClickB()">Backward</button>
                <button v-on:click="onClickL()">TurnLeft</button>
                <button v-on:click="onClickR()">TurnRight</button>
                <button v-on:click="onClickS()">Stop</button>-->

              <b-row align-v="center" align-h="center">
                <b-col sm="6" align-v="center" align-h="center">
                  <b-button  v-if="isStreaming"
                    v-on:click="onClickStartStream()"
                    variant="danger"
                    size="lg"
                    >Stop stream</b-button
                  >

                  <b-button
                    v-else
                    v-on:click="onClickStartStream()"
                    variant="success"
                    size="lg"
                    >Start stream</b-button
                  >

                </b-col>
                <b-col sm="6">
           
                  <img v-if="isStreaming" v-bind:src="'data:image/jpeg;base64,' + imageBytes">
                  <img v-else src="~/assets/images/UI/png/noimage.png"></img>
                </b-col>
              </b-row>
            </div>
          </div>
        </div>
        <div style="height: 200px">
          <div class="row h-100">
            <div class="col-10">
              <div
                class="bg-secondary text-light px-3 py-2 scroll-box"
                ref="logsBox"
              >
                <br />
                <div v-html="result" />
                <div v-html="logs" />
              </div>
            </div>
            <div class="col-2" align-v="center" align-h="center">
             
                <div class="display-panel" v-show="!isExpanded && isRunning">
                  <p class="display-image">
                    <b-img ref="displayImage" src=""> </b-img>
                  </p>
                  <div class="control">
                    <b-form-checkbox
                      class="check"
                      v-model="nDisplay"
                      name="check-button"
                      switch
                    >
                      Detector
                    </b-form-checkbox>
                    <img
                      src="~/assets/images/UI/svg/expad-arrows.svg"
                      height="20"
                      v-b-modal.expanded-camera
                    />
                  </div>
                
              </div>
              <div class="buttom">
                <button
                  v-if="!isRunning"
                  :disabled="isProjectLoaded"
                  pill
                  v-on:click="run"
                  class="btn-run op-btn"
                >
                  <span class="ico"
                    ><img
                      src="~/assets/images/UI/svg/Group 80.svg"
                      alt=""
                      srcset=""
                  /></span>
                </button>

                <!-- <button
            v-if="!isRunning"
            :disabled="isProjectLoaded"
            pill
            v-on:click="$emit('save-workspace')"
            class="btn-run"
            style="margin-left:10px;">
            <span class="ico">
              <img src="../assets/UI/svg/save.svg" alt="" srcset=""/>
            </span>
          </button> -->

                <button
                  v-if="isRunning"
                  :disabled="!isProjectLoaded"
                  pill
                  v-on:click="stop"
                  class="btn-stop"
                >
                  <span class="ico"
                    ><img
                      src="~/assets/images/UI/svg/Group 82.svg"
                      alt=""
                      srcset=""
                  /></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <b-modal
        id="expanded-camera"
        size="xl"
        title="Live view"
        modal-class="my-modal-class my-modal-class-no-pad"
        :centered="true"
        :hide-footer="true"
        :hide-header-close="true"
        @shown="setExpanded(true)"
        @hide="setExpanded(false)"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true"
      >
        <div class="display-image">
          <b-img class="realtime-image" ref="displayImageFull" src=""> </b-img>
          <div class="control">
            <b-form-checkbox
              class="check"
              v-model="nDisplay"
              name="check-button"
              switch
            >
              Detector
            </b-form-checkbox>
            <img
              src="~/assets/images/UI/svg/minimize-arrows.svg"
              height="20"
              @click="$bvModal.hide('expanded-camera')"
            />
          </div>
        </div>
      </b-modal>
    </div>
  </div>
</template>

<script>
/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import Blockly from "blockly";
import blocklyPython from "blockly/python";
import BlocklyJS from "blockly/javascript";
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import Unity from "vue-unity-webgl";
export default {
  name: "BlocklyComponent",
  components: {
    Unity,
  },
  props: {
    /*isRunHiden: Boolean,*/
    isProjectLoaded: Boolean,
    isRunning: Boolean,
  },
  data() {
    return {
      blockly_woakspace: null,
      blockly_xml: "",
      nDisplay: false,
      result: "",
      logs: "",
      s_result: "",
      isExpanded: false,
      intervalID: null,
      imageBytes: null,
      isStreaming: false,
    };
  },

  methods: {
    unityWatch(e) {},
    run() {
      console.log("run!!!!");
      var code1 = Blockly.JavaScript.workspaceToCode(this.blockly_woakspace);
      var codeAsync = "(async () => {\n";
      codeAsync = codeAsync + code1;
      codeAsync = codeAsync + "})()\n";

      console.log(codeAsync);
      console.log(code);
      try {
        eval(codeAsync);
      } catch (error) {
        console.log(error);
      }
    },
    stop() {
      var code = Blockly.JavaScript.workspaceToCode(this.blockly_woakspace);
      console.log(code);
    },
    onClickF() {
      //this.$refs.gameInstance.contentWindow.VK_MovementDirec(0.15, 0);
    },
    onClickStartStream() {
      //this.$refs.gameInstance.contentWindow.VK_MovementDirec(0.15, 0);
      //for (let i = 0; i < 500000; i++) {}
      if (this.isStreaming == false) {
        this.isStreaming = true;
        this.intervalID = setInterval(
          function () {
            this.imageBytes =
              this.$refs.gameInstance.contentWindow.ImageBase64();
          }.bind(this),
          50
        );
      } else {
        this.isStreaming = false;
        console.log("Stop stream");
        clearInterval(this.intervalID);
      }
    },
    onClickB() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(-0.15, 0);
    },
    onClickL() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0, 0.4);
    },
    onClickR() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0, -0.4);
    },
    onClickS() {
      this.$refs.gameInstance.contentWindow.VK_MovementDirec(0, 0);
    },

    setExpanded: function (value) {
      if (value) {
        this.$refs.displayImageFull.src = this.$refs.displayImage.src;
      } else {
        this.$refs.displayImage.src = this.$refs.displayImageFull.src;
      }
      this.isExpanded = value;
    },
  },
  computed: {
    ...mapState(["currentDevice", "serverUrl", "streamUrl"]),
    updateXML: function () {
      console.log("Update XML to workspace");
      this.blockly_woakspace.clear();
      let textToDom = Blockly.Xml.textToDom(this.blockly_xml);
      Blockly.Xml.domToWorkspace(this.blockly_woakspace, textToDom);
    },
    updateOutput: function () {
      console.log("NDisplay =");
      console.log(this.nDisplay);
    },
  },
  watch: {
    nDisplay: {
      deep: true,
      handler: function (newValue) {
        console.log("Selected users changed", newValue);
        if (newValue == false) {
          this.url =
            this.streamUrl + "?topic=/output/image_raw&type=ros_compressed";
          this.$refs.displayImage.src = this.url;
          this.$refs.displayImageFull.src = this.url;
        } else if (newValue == true) {
          this.url =
            this.streamUrl +
            "?topic=/output/image_detected&type=ros_compressed";
          this.$refs.displayImage.src = this.url;
          this.$refs.displayImageFull.src = this.url;
        }
      },
    },
    s_result: function (val) {
      console.log("watch = ");
      this.result += val;
      //console.log(val.toString(16))
      var ss = val.replace(/(<([^>]+)>)/gi, "");

      //const ss = strippedString.replace(/[\n\r\t]/g,);
      var base = 16;

      /*console.log(ss.split('').map(function (c) {
                return c.charCodeAt(0);
            }))
            console.log(ss)*/
      if (ss.replace(/(\r\n|\n|\r)/gm, "") === "DONE") {
        console.log("Finished");
      }
    },
  },

  mounted() {
    window.addEventListener("fn", this.unityWatch);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("fn", this.unityWatch);
    });

    Blockly.Blocks["move"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Linear velocity")
          .appendField(new Blockly.FieldNumber(0, -0.15, 0.15), "lin")
          .appendField("Angular velocity")
          .appendField(new Blockly.FieldNumber(0, -0.5, 0.5), "ang");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
      },
    };

    Blockly.JavaScript["move"] = function (block) {
      var number_lin = block.getFieldValue("lin");
      var number_ang = block.getFieldValue("ang");
      // TODO: Assemble JavaScript into code variable.
      var code =
        "this.$refs.gameInstance.contentWindow.VK_MovementDirec(" +
        number_lin +
        " ," +
        number_ang +
        ");\n";
      return code;
    };

    Blockly.Blocks["delay"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("delay")
          .appendField(new Blockly.FieldNumber(0), "ms")
          .appendField("ms");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
      },
    };

    Blockly.JavaScript["delay"] = function (block) {
      var number_ms = block.getFieldValue("ms");
      // TODO: Assemble JavaScript into code variable.
      var code = "await new Promise(r => setTimeout(r," + number_ms + "));\n";
      return code;
    };

    const base_blocks = `<xml>
          <category name="Logic" colour="%{BKY_LOGIC_HUE}">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_negate"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Loops" colour="%{BKY_LOOPS_HUE}">
            <block type="controls_repeat_ext">
              <value name="TIMES">
                <block type="math_number">
                  <field name="NUM">10</field>
                </block>
              </value>
            </block>
            <block type="controls_whileUntil"></block>
          </category>
          <category name="Math" colour="%{BKY_MATH_HUE}">
            <block type="math_number">
              <field name="NUM">123</field>
            </block>
            <block type="math_arithmetic"></block>
            <block type="math_single"></block>
          </category>
          <category name="Text" colour="%{BKY_TEXTS_HUE}">
            <block type="text"></block>
            <block type="text_length"></block>
            <block type="text_print"></block>
          </category>
          <category name="Variables" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}">
            </category>
          <category name="Kidbright Bot" colour="%{BKY_LOOPS_HUE}">
            <block type="move"></block>
            <block type="delay"></block>
            
          </category>
        </xml>`;

    setTimeout(() => {
      //alert("Hello blockly")
      var tt = {};
      tt.toolbox = base_blocks;
      tt.scrollbars = true;
      tt.css = true;
      tt.zoom = {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 4,
        minScale: 0.25,
        scaleSpeed: 1.1,
      };

      var blckDiv = this.$refs["blocklyDiv"];
      this.blockly_woakspace = Blockly.inject(this.$refs["blocklyDiv"], tt);
      //>>>>>>>>>>>> this.$store.commit("setBlocklyWorkspace", this.blockly_woakspace);
      console.log("Injection running ***********************************");
      //console.log(this.blockly_woakspace)
      this.loaded = true;
    }, 500);
  },
  created() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "setBlocklyXml") {
        setTimeout(() => {
          console.log("updating xml !!!!!!!!!");
          //console.log(state.blockly_xml)
          this.blockly_xml = state.blockly_xml;
          // console.log('blockly_xml == ',this.blockly_xml)
          //this.blockly_woakspace = state.blockly_xml
          this.blockly_woakspace.clear();
          let textToDom = Blockly.Xml.textToDom(this.blockly_xml);
          Blockly.Xml.domToWorkspace(this.blockly_woakspace, textToDom);
        }, 500);
      }
    });
  },
  beforeDestroy() {
    clearInterval(this.intervalID);
    this.unsubscribe();
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
