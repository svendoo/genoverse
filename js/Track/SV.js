Genoverse.Track.SV = Genoverse.Track.DAS.Sequence.extend({

  // defaults
  complementary : false,
  yOffset       : 10,
  height        : 100,
  distance      : 0.2,
  yOffset       : 35,
  featureHeight : 15,
  shadow        : {
    offsetX : 0,
    offsetY : 0,
    blur    : 5,
    color   : "black"
  },


  // I guess getData vould be different to get both sequence and variation

  drawFeatures: function (image, features) {
    this.base(image, features);
    // TODO: overlapping variations only
    this.drawVariations(image, this.variations);
  },


  drawVariations: function (image, variations) {
    for (var i = 0; i < variations.length; i++) {
      var variation = variations[i];
      variation.scaledStart = variation.start * this.scale - image.scaledStart;
      variation.scaledWidth = (variation.end - variation.start) * this.scale; 

      this['draw' + variations[i].type].call(this, image, variation);
    }    
  },


  drawDeletion: function (image, variation) {
    var featureHeight = this.complementary ? this.featureHeight * 2 : this.featureHeight;

    this.applyShadow();
    this.context.lineWidth = 3;
    this.context.strokeStyle = 'red';
    this.context.strokeRect(variation.scaledStart, this.yOffset, variation.scaledWidth, featureHeight);
    this.repealShadow();

    this.context.fillStyle = 'rgba(50,0,0,0.7)';
    this.context.fillRect(variation.scaledStart, this.yOffset, variation.scaledWidth, featureHeight);
  },


  drawInDel: function (image, variation) {
    var featuresHeight = this.complementary ? this.featureHeight * 2 : this.featureHeight;
    var referenceScaledWidth = variation.reference_allele.length * this.scale; 
    var alternateScaledWidth = variation.alternate_allele.length * this.scale; 

    this.context.strokeStyle = this.variationColor(variation);

    this.applyShadow();
    this.context.beginPath();
    this.context.moveTo(variation.scaledStart + (referenceScaledWidth - alternateScaledWidth)/2, this.yOffset - (1 + this.distance)*this.featureHeight);
    this.context.lineTo(variation.scaledStart + (referenceScaledWidth + alternateScaledWidth)/2, this.yOffset - (1 + this.distance)*this.featureHeight);
    this.context.lineTo(variation.scaledStart + (referenceScaledWidth + alternateScaledWidth)/2, this.yOffset - this.distance*this.featureHeight);
    this.context.lineTo(variation.scaledStart + referenceScaledWidth, this.yOffset);

    if (this.complementary) {
      this.context.lineTo(variation.scaledStart + referenceScaledWidth, this.yOffset + 2*this.featureHeight);
      this.context.lineTo(variation.scaledStart, this.yOffset + 2*this.featureHeight);
    } else {
      this.context.lineTo(variation.scaledStart + referenceScaledWidth, this.yOffset + this.featureHeight);
      this.context.lineTo(variation.scaledStart, this.yOffset + this.featureHeight);
    }

    this.context.lineTo(variation.scaledStart, this.yOffset);
    this.context.lineTo(variation.scaledStart + (referenceScaledWidth - alternateScaledWidth)/2, this.yOffset - this.distance*this.featureHeight);
    this.context.lineTo(variation.scaledStart + (referenceScaledWidth - alternateScaledWidth)/2, this.yOffset - (1 + this.distance)*this.featureHeight);
    this.context.closePath();

    this.context.stroke();
    this.repealShadow();

    this.context.fillStyle   = this.variationColor(variation);
    this.context.globalAlpha = 0.7;
    this.context.fill();
    this.context.globalAlpha = 1;


    this.drawSequence(
      image, 
      { start: variation.start, end: variation.end, sequence: variation.alternate_allele.toLowerCase() }, 
      this.yOffset - (1 + this.distance)*this.featureHeight, 
      (referenceScaledWidth - alternateScaledWidth)/2,
      false
    );

    // if (this.complementary) {
    //   var track = this;
    //   this.drawSequence(
    //     image, 
    //     { start: variation.start, end: variation.end, sequence: this.complement(variation.alternate_allele) }, 
    //     this.yOffset + featureHeight, 
    //     false
    //   );
    // }    
  },


  variationColor: function (variation) {
    return '#1DD300';
  },

  click: function (e) {
    var x = (e.pageX - this.container.parent().offset().left)/this.scale + this.browser.start;
    var y = e.pageY - $(e.target).offset().top;    

    for (var i = 0; i < this.variations.length; i++) {
      var variation = this.variations[i];
      if (x > variation.start && x < variation.start + Math.max(variation.reference_allele.length, variation.alternate_allele.length)) {
        this.browser.makeMenu(variation, { left: e.pageX, top: e.pageY }, this);
      }
    }
  },


  populateMenu: function (variation) {
    return {
      title : variation.type,
      Start : variation.start,
      End   : variation.end
    };
  },


  applyShadow: function () {
    if (this.shadow) {
      this.context.shadowOffsetX = this.shadow.offsetX;
      this.context.shadowOffsetY = this.shadow.offsetY;
      this.context.shadowBlur    = this.shadow.blur;
      this.context.shadowColor   = this.shadow.color;
    }
  },

  repealShadow: function () {
    this.context.shadowBlur = 0;
  },

});