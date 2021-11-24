export default class Context {
    action;
    value;
}

export interface DevCommand {
    interpret(connection, context: Context);
}

export class DevMoneyCommand implements DevCommand {
    interpret(connection, context: Context) {
        connection.send('clientMessage', JSON.stringify({
            type: 'DEV_MONEY',
            data: {
              action: context.action,
              value: context.value
            }
          }));
    }
}

export class DevResetCommand implements DevCommand {
    interpret(connection, context: Context) {
        connection.send('clientMessage', JSON.stringify({
            type: 'DEV_GAME',
            data: {
              action: context.action
            }
          }));
    }
}
