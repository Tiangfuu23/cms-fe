import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/featService/toast.service';
import { Constant, StorageKeys } from '../../shared/constants/Constants.class';
import { ConfirmationService } from 'primeng/api';
import { ProductService } from '../../services/beService/product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../services/beService/category.service';
import { SupabaseService } from '../../services/beService/supabase.service';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  products : any[] = [];
  product_status: any[] = [];
  userInfo : any;

  productFrm !: FormGroup;
  loading: boolean = false;

  dialog : {
    isVisibleDialog: boolean,
    header: string,
    isEditDialog: boolean,
    isCreateDialog: boolean,
    selectedProduct: {
      id: number
      productName: string,
      description: string,
      category: {
        id: number,
        categoryName: string
      },
      status: {
        id: number,
        status: string,
      },
      price: number
    } | null
  } = {
    isVisibleDialog: false,
    header: '',
    isEditDialog: false,
    isCreateDialog: false,
    selectedProduct: null
  }

  mapCateogryId2ProductCnt: Map<number, number> = new Map();

  // subscription
  productSub !: Subscription;
  categorySub !: Subscription;
  constructor(
    private productService : ProductService,
    private toastService : ToastService,
    private confirmationService : ConfirmationService,
    private formBuilder : FormBuilder,
    private categoryService : CategoryService,
    private supabaseService : SupabaseService
  ){

  }

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!);
    this.initCategories();
    this.initProducts();
    this.initProductFrm();
    this.initProductStatuses();
  }

  ngOnDestroy(): void {
    this.productSub?.unsubscribe();
    this.categorySub?.unsubscribe();
  }

  initCategories(){
    this.categorySub?.unsubscribe();
    this.categorySub = this.categoryService.getCategories().subscribe({
      next: (res : any) => {
        // console.log(res);
        this.categories = res;
      },
      error: (error : any) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
      }
    })
  }

  initProducts(){
    this.loading = true;
    this.productSub?.unsubscribe();
    this.productSub = this.productService.getProducts().subscribe({
      next : (res) => {
        // console.log(res);
        this.products = res;
        this.mapCateogryId2ProductCnt.clear();
        this.products.forEach(p => {
          this.mapCateogryId2ProductCnt.set(p.category.id, (this.mapCateogryId2ProductCnt.get(p.category.id) ?? 0) + 1 );
        })
        console.log(this.mapCateogryId2ProductCnt);
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
        this.loading = false;
      }
    })
  }

  initProductFrm(){
    this.productFrm = this.formBuilder.group({
      productName: ['', [Validators.required]],
      description: [''],
      price: [null, [Validators.required]],
      status: [null, [Validators.required]],
      active: [true, [Validators.required]],
      category: [null, [Validators.required]]
    })
  }

  initProductStatuses(): void {
    for(let [key,value] of Object.entries(Constant.PRODUCT_STATUS)){
      this.product_status.push({
        status: key,
        id: value
      })
    }
    console.log(this.product_status);
  }

  showEditCateDialog(product : any){
    // console.log(product)
    this.dialog = {
      isVisibleDialog: true,
      header: "Edit category",
      isEditDialog: true,
      isCreateDialog: false,
      selectedProduct: product
    }
    this.productFrm.patchValue({
      productName: product.productName,
      description: product.description,
      category: product.category,
      status: this.product_status.find(status => status.id === product.status),
      price: product.price,
      active: product.active
    })
  }
  showCreateProductDialog(){
    this.initProductFrm();
    this.dialog = {
      isVisibleDialog: true,
      header: "Create product",
      isEditDialog: false,
      isCreateDialog: true,
      selectedProduct: null
    }
  }
  hideProductFrm(){
    this.dialog = {
      isVisibleDialog: false,
      header: '',
      isEditDialog: false,
      isCreateDialog: false,
      selectedProduct: null
    }
  }
  handleSaveProductDialog(){
    if(!this.validateProductFrm()) return;
    const frmValue = this.productFrm.value;
    const payload:any = {
      productName: frmValue.productName.trim(),
      description: frmValue.description.trim(),
      price: frmValue.price,
      status: frmValue.status.id,
      userId: this.userInfo.id,
      categoryId: frmValue.category.id,
      active: frmValue.active
    }
    // console.log('payload from create product', payload);

    if(this.dialog.isEditDialog){
      payload.id = this.dialog.selectedProduct?.id!;
      this.productService.updateProduct(payload.id!, payload).subscribe({
        next: (res) => {
          // console.log(res);
          this.toastService.showSucces("Cập nhật thành công!");
          this.initProducts();
          this.hideProductFrm();
        },
        error: (error) => {
          console.log(error);
          this.toastService.showError(error.error.Message)
        }
      })
    }else if(this.dialog.isCreateDialog){
      this.productService.createProduct(payload).subscribe({
        next: async (res) => {
          console.log(res);
          const newlyCreatedProductId = res.id;
          await this.supabaseService.insertProduct({
            id: newlyCreatedProductId,
            ...payload
          })
          this.initProducts();
          this.hideProductFrm();
          this.toastService.showSucces("Thêm mới thành công!");
        },
        error: (error) => {
          console.log(error);
          this.toastService.showError(error.error.Message);
        }
      })
    }
  }

  confirmDeleteProduct(event : any, product : any){
    // console.log("Product for delete", product);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this product?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: (res) => {
            // console.log('res from delete product', res);
            this.toastService.showSucces("Xóa product thành công!");
            this.initProducts();
          },
          error: (error) => {
            console.log(error);
            this.toastService.showError(error.error.Message);
          }
        })
      },
    });
  }

  getProductSeverity(status: number) : string{
        switch (status) {
            case Constant.PRODUCT_STATUS.INSTOCK:
                return 'status-instock';
            case Constant.PRODUCT_STATUS.LOWSTOCK:
                return 'status-lowstock';
            case Constant.PRODUCT_STATUS.OUTOFSTOCK:
                return 'status-outofstock';
        }
        return "info";
  }

  getProductStatusSeverity(active: boolean): string {
    if(active) return "active";
    return "inactive"
  }

  getProductStatusString(status: number) : string {
    switch (status) {
      case Constant.PRODUCT_STATUS.INSTOCK:
          return 'IN STOCK';
      case Constant.PRODUCT_STATUS.LOWSTOCK:
          return 'LOW STOCK';
      case Constant.PRODUCT_STATUS.OUTOFSTOCK:
          return 'OUT OF STOCK';
  }
    return "UNDEFINED";
  }


  validateProductFrm() : boolean {
    const frmValue = this.productFrm.value;
    // console.log(frmValue);
    if(frmValue.productName.trim() === ""){
      this.toastService.showError("Tên sản phẩm không thể để trống!");
      return false;
    }
    if(!frmValue.category || !frmValue.price || !frmValue.status){
      this.toastService.showError(`${!frmValue.category ? "Category": (!frmValue.price ? "Giá sản phẩm" : "Trạng thái sản phẩm")} không thể để trống!`)
      return false;
    }
    return true;
  }

}
