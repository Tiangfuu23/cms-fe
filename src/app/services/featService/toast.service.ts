import { Injectable } from '@angular/core';
import { MessageService, Message } from 'primeng/api';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private defaultMessage : Message = {
    life: 3000,
    // sticky: true
  }
  constructor(private messageService : MessageService) { }

  showSucces(messageDetail: string){
    console.log("Show success toast");
    this.messageService.add({
      severity: "success",
      summary: "Thành công",
      detail: messageDetail,
      ...this.defaultMessage
    })
  }
  showError(messageDetail: string){
    console.log("Show error toast");
    this.messageService.add({
      severity: "error",
      summary: "Có lỗi xảy ra",
      detail: messageDetail ?? "Lỗi không xác định!",
      ...this.defaultMessage
    })
  }
}
