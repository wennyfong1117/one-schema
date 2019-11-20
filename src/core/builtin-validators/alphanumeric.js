export default (input) => typeof input === 'string' && input.length !== 0 && !(/[^0-9|a-z]/i.test(input));
