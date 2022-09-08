export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_classification_init_model"] = {
    init: function () {
      this.appendDummyInput().appendField("initial model");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_init_model"] = function (block) {
    var code = `
      this.term.write("Loading model\\r\\n");
      await this.initModel();
      this.term.write("Model loaded\\r\\nLoading label : ");
      const __labels = await this.getLabels();
      this.term.write(__labels.join(",") + "\\r\\n");
      let inputShape = this.model.layers[0].inputSpec[0].shape;
      this.term.write("Model Input Shape : " + inputShape.join(",") + "\\r\\n");
      this.term.write("Preloading model\\r\\n");
      const zeroTensor = tf.zeros([1, inputShape[1], inputShape[2], inputShape[3]], 'int32');
      const result = await this.model.predict(zeroTensor);
      const res = await result.data();
      result.dispose();
      zeroTensor.dispose();
      this.term.write("Preload model success\\r\\n");
      const load_image = function(url){
        return new Promise((resolve, reject) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.src = url;
          im.onload = () => {
            resolve(im)
          }
        });
      };
      const __classify = async function(model, img){
        let inputShape = model.layers[0].inputSpec[0].shape;
        const batched = tf.tidy(()=>{
          const normalized = tf.add(tf.mul(tf.cast(img, 'float32'), (2 / 255.0)), -1); //min -1 to max 1
          let resized = tf.image.resizeBilinear(normalized, [inputShape[1], inputShape[2]], true); //alignCorners = true;
          const batched = tf.reshape(resized, [-1, inputShape[1], inputShape[2], inputShape[3]]); //return tf.expandDims(img);
          return batched;
        });
        let res = await model.predict(batched);
        return res;
      }
      let __raw_image = "";
      let __image = null;
      let __image_tensor = null;
      let __res = null;
      let __data = null;
      let __maxIndex = 0;
      this.term.write("Model loaded\\r\\n");
    `;
    return code;
  };

  Blockly.Blocks["tfjs_classification_classify"] = {
    init: function () {
      this.appendDummyInput().appendField("classify image");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_classify"] = function (block) {
    var code = `
      __raw_image = "data:image/jpeg;base64," + this.$refs.simulator.$refs.gameInstance.contentWindow.ImageBase64();
      __image = await load_image(__raw_image);
      __image_tensor = await tf.browser.fromPixels(__image);
      __res = await __classify(this.model, __image_tensor);
      __data = __res.dataSync();
      __maxIndex = __res.argMax(1).dataSync()[0];
      this.result = __labels[__maxIndex] + " (" + __data[__maxIndex].toFixed(3) + ")";
      this.term.write("\\rclassify result = " + __labels[__maxIndex] + ", prob = " + __data[__maxIndex].toFixed(3));
    `;
    return code;
  };

  Blockly.Blocks["tfjs_classification_get_class_name"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class name");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_name"] = function (block) {
    var code = "__labels[__maxIndex]";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks["tfjs_classification_get_class_prob"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class probability");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_prob"] = function (block) {
    var code = "__data[__maxIndex]";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_classification_get_class_index"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class index");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_index"] = function (block) {
    var code = "__maxIndex";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  //=====================================//

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
    var code =
      "this.$refs.simulator.$refs.gameInstance.contentWindow.VK_MovementDirec(" +
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
    var code = "await new Promise(r => setTimeout(r," + number_ms + "));\n";
    return code;
  };
};
