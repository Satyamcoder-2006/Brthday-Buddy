import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './Media3Transformer.types';

type Media3TransformerModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class Media3TransformerModule extends NativeModule<Media3TransformerModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(Media3TransformerModule, 'Media3TransformerModule');
