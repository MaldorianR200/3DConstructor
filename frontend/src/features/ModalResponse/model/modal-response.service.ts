import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalResponseService {
  responseMessages: Record<string, Record<string, string>> = {
    200: {
      text: 'Успешно!',
      btn: 'Продолжить',
    },
    403: {
      text: 'У вас нет доступа!',
      btn: 'Продолжить',
    },
    406: {
      text: 'Получилась круговая зациклинность',
      btn: 'Поменять категорию родителя!',
    },
    409: {
      text: 'Такое название уже занято.',
      btn: 'Переименовать!',
    },
    413: {
      text: 'Добавлено слишком много данных за раз!',
      btn: 'Попробуйте сжать файлы',
    },
    500: {
      text: 'Ошибка сервера!',
      btn: 'Попробовать еще раз',
    },
  };
  isOpen: boolean = false;
  isLoad: boolean = false;
  isComplete: boolean = false;
  resText: string = 'Что-то пошло не так!';
  resBtn: string = 'Попробовать еще раз.';

  start() {
    console.log('start');
    this.isOpen = true;
    this.isLoad = true;
  }

  setStatus(res: any) {
    console.log('end');
    this.isComplete = false;
    this.isLoad = false;

    if (this.responseMessages[res.status]) {
      this.resText = this.responseMessages[res.status]['text'];
      this.resBtn = this.responseMessages[res.status]['btn'];
    }
    if (res.status == 200) {
      this.isComplete = true;
    }
  }
}
