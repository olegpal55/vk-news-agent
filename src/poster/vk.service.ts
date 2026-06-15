import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VkService {
  private readonly logger = new Logger(VkService.name);
  private readonly token = process.env.VK_ACCESS_TOKEN;
  private readonly groupId = process.env.VK_GROUP_ID;
  private readonly apiVersion = '5.199';

  async postToWall(message: string, imageUrl?: string): Promise<boolean> {
    try {
      let attachments = '';

      // Если есть картинка — загружаем ее в VK
      if (imageUrl) {
        const photoId = await this.uploadPhoto(imageUrl);
        if (photoId) attachments = photoId;
      }

      const params: any = {
        access_token: this.token,
        owner_id: `-${this.groupId}`,
        message,
        v: this.apiVersion,
        from_group: 1,
      };

      if (attachments) params.attachments = attachments;

      const res = await axios.post(
        'https://api.vk.com/method/wall.post',
        null,
        { params },
      );

      if (res.data.error) {
        throw new Error(res.data.error.error_msg);
      }

      this.logger.log(`✅ Пост #${res.data.response?.post_id} опубликован в VK`);
      return true;
    } catch (err) {
      this.logger.error(`VK ошибка публикации: ${err.message}`);
      return false;
    }
  }

  private async uploadPhoto(imageUrl: string): Promise<string | null> {
    try {
      // Получаем upload server
      const serverRes = await axios.get('https://api.vk.com/method/photos.getWallUploadServer', {
        params: {
          access_token: this.token,
          group_id: this.groupId,
          v: this.apiVersion,
        },
      });
      const uploadUrl = serverRes.data.response?.upload_url;
      if (!uploadUrl) return null;

      // Загружаем фото через URL
      const imgBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const FormData = require('form-data');
      const form = new FormData();
      form.append('photo', Buffer.from(imgBuffer.data), { filename: 'photo.jpg', contentType: 'image/jpeg' });

      const uploadRes = await axios.post(uploadUrl, form, { headers: form.getHeaders() });
      const { server, photo, hash } = uploadRes.data;

      // Сохраняем
      const saveRes = await axios.post('https://api.vk.com/method/photos.saveWallPhoto', null, {
        params: {
          access_token: this.token,
          group_id: this.groupId,
          server,
          photo,
          hash,
          v: this.apiVersion,
        },
      });

      const saved = saveRes.data.response?.[0];
      if (saved) return `photo${saved.owner_id}_${saved.id}`;
    } catch (err) {
      this.logger.warn(`Фото не загрузилось, публикуем без фото: ${err.message}`);
    }
    return null;
  }
}
