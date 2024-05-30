import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from '../../services/beService/category.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/featService/toast.service';
import { StorageKeys } from '../../shared/constants/Constants.class';
import { ConfirmationService } from 'primeng/api';
import { SupabaseService } from '../../services/beService/supabase.service';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit, OnDestroy{
  categories : any[] = [];
  userInfo : any;
  loading: boolean = false;


  dialog : {
    isVisibleDialog: boolean,
    header: string,
    categoryName: string,
    isEditDialog: boolean,
    isCreateDialog: boolean,
    selectedCategory: {
      categoryName: string,
      id: number
    } | null
  } = {
    isVisibleDialog: false,
    header: '',
    categoryName: '',
    isEditDialog: false,
    isCreateDialog: false,
    selectedCategory: null
  }

  // subscription
  getCategorySub !: Subscription;

  constructor(
    private categoryService : CategoryService,
    private toastService : ToastService,
    private confirmationService : ConfirmationService,
    private supabaseService : SupabaseService
  ){}

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!);
    if(this.userInfo.roleId )
    this.checkToken();
    this.initCategories();
  }

  ngOnDestroy(): void {
    this.getCategorySub?.unsubscribe();
  }

  checkToken(){
    this.categoryService.checkToken().subscribe({
      error: (error) => {
        console.log(error);
      }
    })
  }

  initCategories(){
    this.loading = true;
    this.getCategorySub?.unsubscribe();
    this.getCategorySub = this.categoryService.getCategories().subscribe({
      next : (res) => {
        console.log(res);
        this.categories = res;
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
        this.loading = false;
      }
    })
  }

  showEditCateDialog(category : any){
    console.log(category)
    this.dialog = {
      isVisibleDialog: true,
      header: "Edit category",
      categoryName: category.categoryName,
      isEditDialog: true,
      isCreateDialog: false,
      selectedCategory: category
    }
  }
  showCreateCateDialog(){
    this.dialog = {
      isVisibleDialog: true,
      header: "Create category",
      categoryName: '',
      isEditDialog: false,
      isCreateDialog: true,
      selectedCategory: null
    }
  }
  hideCateDialog(){
    this.dialog = {
      isVisibleDialog: false,
      header: '',
      categoryName: '',
      isEditDialog: false,
      isCreateDialog: false,
      selectedCategory: null
    }
  }
  handleSaveCateDialog(){
    if(this.dialog.isEditDialog){
      const payload =  {
        id: this.dialog.selectedCategory!.id,
        categoryName: this.dialog.categoryName
      }
      this.categoryService.updateCategory(payload.id!, payload).subscribe({
        next: async (res) => {
          console.log(res);
          await this.supabaseService.updateCategory(payload);
          this.initCategories();
          this.hideCateDialog();
          this.toastService.showSucces("Cập nhật thành công!");
        },
        error: (error) => {
          console.log(error);
          this.toastService.showError(error.error.Message)
        }
      })
    }else if(this.dialog.isCreateDialog){
      const payload = {
        categoryName: this.dialog.categoryName,
        userId: this.userInfo.id,
      }
      this.categoryService.createCategory(payload).subscribe({
        next: async (res) => {
          console.log(res);
          const newlyCreatedCateId = res.id;
          const data = await this.supabaseService.insertCategory({
            id : newlyCreatedCateId,
            ...payload
          })
          console.log('insert data in cate tbl in supabase', data);
          this.initCategories();
          this.hideCateDialog();
          this.toastService.showSucces("Thêm mới thành công!");
        },
        error: (error) => {
          console.log(error);
          this.toastService.showError(error.error.Message);
        }
      })
      console.log(payload);
    }
  }

  confirmDeleteCate(event : any, category : any){
    console.log(category);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this category?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: async (res) => {
            await this.supabaseService.delelteCategory(category.id);
            console.log('delete category', res);
            this.initCategories();
            this.toastService.showSucces("Xóa category thành công!");
          },
          error: (error) => {
            console.log(error);
            this.toastService.showError(error.error.Message);
          }
        })
      },
    });
  }

  handleSearchFilter(table: Table, $event : any){
    table.filterGlobal($event.target.value, 'contains');
  }
}
