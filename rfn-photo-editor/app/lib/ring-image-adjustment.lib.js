Filter.register('ringImgAdjustment', ringImageAdjustments);

function ringImageAdjustments(adjustmentList) {
    return this.process('ringImgAdjustment', function adjustmentFunc(rgba) {
        var i,
            adjust,
            max;
        for (i = 0; i < adjustmentList.length; i++) {
            adjust = adjustmentList[i].value;

            switch (adjustmentList[i].name) {
                case 'brightness':
                    adjust = Math.floor(255 * (adjust / 100));
                    rgba.r += adjust;
                    rgba.g += adjust;
                    rgba.b += adjust;
                    break;

                case 'contrast':
                    adjust = Math.pow((adjust + 100) / 100, 2);
                    rgba.r /= 255;
                    rgba.r -= 0.5;
                    rgba.r *= adjust;
                    rgba.r += 0.5;
                    rgba.r *= 255;
                    rgba.g /= 255;
                    rgba.g -= 0.5;
                    rgba.g *= adjust;
                    rgba.g += 0.5;
                    rgba.g *= 255;
                    rgba.b /= 255;
                    rgba.b -= 0.5;
                    rgba.b *= adjust;
                    rgba.b += 0.5;
                    rgba.b *= 255;
                    break;

                case 'saturation':
                    adjust *= -0.01;
                    max = Math.max(rgba.r, rgba.g, rgba.b);
                    if (rgba.r !== max) rgba.r += (max - rgba.r) * adjust;
                    if (rgba.g !== max) rgba.g += (max - rgba.g) * adjust;
                    if (rgba.b !== max) rgba.b += (max - rgba.b) * adjust;
                    break;

                case 'sharpen':
                    break;
            }
        }
        return rgba;
    });
}