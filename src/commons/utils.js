const throttle = (func, wait, options) => {
  let timeout, context, args, result, previous = 0,
    now = Date.now || new Date().getTime;
  if (!options) options = {};// eslint-disable-line no-param-reassign
  const later = () => {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null; // eslint-disable-line no-multi-assign
  };
  const throttled = () => {
    now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    // args = arguments;// eslint-disable-line prefer-rest-params
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;// eslint-disable-line no-multi-assign
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
  throttled.cancel = () => {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;// eslint-disable-line no-multi-assign
  };
  return throttled;
};

export default throttle;
