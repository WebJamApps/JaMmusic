// export class FormValidator {
//   constructor(validator, cb) {
//     this.validator = validator;
//     this.cb = cb;
//     this.preventDefault = this.preventEnter.bind(this);
//     window.addEventListener('keypress', this.preventDefault, false);
//   }
//
//   preventEnter(e) {
//     if (e.keyCode === 13) {
//       e.preventDefault();
//     }
//   }
//
//   /**
//   * This method will be called by the controller when validating a specific field. For instance,
//   * when the user is interacting with the title input. So, we need to validate the whole form
//   * and call our callback in order for TodoPage.canSave to be correctly updated.
//   */
//   validateProperty(object, propertyName, rules) {
//     const validationDefered = this.validator.validateProperty(object, propertyName, rules);
//     validationDefered.then(() => this.validateObject(object, rules));
//
//     return validationDefered;
//   }
//
//   /**
//   * Each time the whole form is validated, we call the registered callback to do whatever
//   * the user wants to do with the results of the validation. In our case: update
//   * TodoPage.canSave.
//   */
//   validateObject(object, rules) {
//     return this.validator.validateObject(object, rules).then((results) => {
//       this.cb(results);
//       return results;
//     });
//   }
//
//   /**
//   * Implemented so the interface is complete.
//   */
//   ruleExists(rules, rule) {
//     return this.validator(rules, rule);
//   }
// }
