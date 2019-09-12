import FieldValidator from './FieldValidator';

const fvInstance = new FieldValidator();
const emptyValArgs = {
  allowNaN: new FieldValidator().float64().allowNaN().settings.allowNaN,
  required: new FieldValidator().float64().required().settings.required,
  allowNull: new FieldValidator().string().allowNull().settings.allowNull,
  primaryKey: new FieldValidator().int32().primaryKey().settings.primaryKey,
  autoIncrement: new FieldValidator().int32().autoIncrement().settings.autoIncrement,
};

function createInstanceFromFVMain(fieldValidator) {
  const root = new FieldValidator();
  Object.assign(root.settings, fieldValidator.settings);
  const { arrayOf, schema } = root.settings;
  if (arrayOf) {
    root.settings.arrayOf = createInstanceFromFVMain(arrayOf);
  }
  if (schema) {
    const nSchema = {};
    Object.keys(schema).forEach((k) => {
      if (schema[k] && schema[k].settings) {
        nSchema[k] = createInstanceFromFVMain(schema[k]);
      }
    });
  }
  return root;
}

export function createInstanceFromFV(fieldValidator) {
  return createInstanceFromFVMain(JSON.parse(JSON.stringify(fieldValidator)));
}

export function fvToJS(fv) {
  const parts = ['ons()'];
  if (fv.settings.arrayOf) {
    parts.push(`arrayOf(${fv.settings.arrayOf.toJS()})`);
  } else if (fv.settings.schema) {
    const { schema } = fv.settings;
    const schLines = [];
    Object.keys(schema).forEach((k) => {
      if (schema[k] && schema[k].settings) {
        schLines.push(
          `${JSON.stringify(k)}: ${createInstanceFromFV(schema[k]).toJS()}`
        );
      }
    });
    parts.push(`object({${schLines.join(', ')}})`);
  } else {
    parts.push(`${fv.settings.type}()`);
  }
  Object.keys(fv.settings).forEach((k) => {
    if (k !== 'type' && k !== 'schema' && k !== 'arrayOf' && typeof fv.settings[k] !== 'undefined' && typeof fvInstance[k] === 'function') {
      const str = emptyValArgs[k] === fv.settings[k] ? (`${k}()`) : (`${k}(${JSON.stringify(fv.settings[k])})`);
      if (parts.indexOf(str) === -1) {
        parts.push(str);
      }
    }
  });
  return parts.join('.');
}
