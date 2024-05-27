import { Component, OnInit, OnDestroy } from '@angular/core';
import { BillService } from '../../services/beService/billService.service';
import { CategoryService } from '../../services/beService/category.service';
import { ProductService } from '../../services/beService/product.service';
import { ToastService } from '../../services/featService/toast.service';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { Constant, StorageKeys } from '../../shared/constants/Constants.class';
import { SupabaseService } from '../../services/beService/supabase.service';

interface IProductDetails  {
  id : number,
  productName: string,
  price: number,
  quantity : number,
  categoryName: string,
  totalSubPrice(): number;

}

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent implements OnInit, OnDestroy {
  userInfo: any;
  loading: boolean = false;
  categories: any[] = [];
  bills: any[] = [];
  products: any[] = [];
  paymentMethods: any[] = []
  dialog: {
    isVisible: boolean,
    categoryList: any[],
    filtedProductList: any[],
    selectedPaymentMethod: any,
    selectedCategory: any,
    selectedProduct: any,
    quantity: number | null,
    price: number | null,
    total: number
    productDetailsList: IProductDetails[]
  } = {
    isVisible: false,
    categoryList: this.categories,
    filtedProductList: [],
    selectedPaymentMethod: null,
    selectedCategory: null,
    selectedProduct: null,
    quantity: null,
    price: null,
    productDetailsList: [],
    total: 0
  }
  staticFilePdfUrl: string = 'http://localhost:5018/Staticfiles/pdf'
  // Subscription
  billSub !: Subscription;
  cateSub !: Subscription;
  productSub !: Subscription;

  // testing
  // testDate : Date = new Date();

  constructor(
    private billService : BillService,
    private categoryService: CategoryService,
    private productService : ProductService,
    private toastService : ToastService,
    private confirmationService: ConfirmationService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeys.USER_INFO)!);
    this.initCategory();
    this.initProduct();
    this.initPaymentMethods();
    this.initBills();
  }

  ngOnDestroy(): void {
    this.billSub?.unsubscribe();
  }

  initBills(){
    this.loading = true;
    this.billSub?.unsubscribe();
    this.billSub = this.billService.getBills().subscribe({
      next: (res) => {
        console.log(res);
        this.bills = res;
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
        this.loading = false;
      }
    })
  }

  initCategory() {
    this.cateSub?.unsubscribe();
    this.cateSub = this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log(res);
        this.categories = res;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
      }
    })
  }

  initProduct() {
    this.productSub?.unsubscribe();
    this.productSub = this.productService.getProducts().subscribe({
      next: (res) => {
        console.log(res);
        this.products = res;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
      }
    })
  }

  initPaymentMethods(){
    for(let [key,value] of Object.entries(Constant.PAYMENT_METHOD)){
      this.paymentMethods.push({
        id: value,
        description: key
      })
    }
  }

  showCreateBillDialog() : void {
    this.dialog = {
      isVisible: true,
      categoryList: this.categories,
      filtedProductList: [],
      selectedPaymentMethod: null,
      selectedCategory: null,
      selectedProduct: null,
      quantity: null,
      price: null,
      productDetailsList: [],
      total: 0
    }
  }

  hideBillDialog(): void {
    this.dialog = {
      isVisible: false,
      categoryList: this.categories,
      filtedProductList: [],
      selectedPaymentMethod: null,
      selectedCategory: null,
      selectedProduct: null,
      quantity: null,
      price: null,
      productDetailsList: [],
      total: 0
    }
  }

  handleSaveBillDialog() : void {
    if(!this.dialog.selectedPaymentMethod){
      this.toastService.showError("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    if(this.dialog.productDetailsList.length === 0){
      this.toastService.showError("Hóa đơn không được để trống!");
      return;
    }
    const payload = {
      // creationDate: this.testDate.toISOString(), // for testing
      creationDate: new Date().toISOString(),
      userId: this.userInfo.id,
      paymentMethodId: this.dialog.selectedPaymentMethod.id,
      productDetails: this.dialog.productDetailsList
    }

    let totalPrice = 0;
    payload.productDetails.forEach(p => totalPrice += p.totalSubPrice())

    this.billService.createBill(payload).subscribe({
      next: (res) => {
        console.log(res);
        const newCreatedBillId = res.id;
        this.supabaseService.insertBill({
          ...payload,
          id : newCreatedBillId,
          totalPrice
        })
        this.initBills();
        this.hideBillDialog();
        this.toastService.showSucces("Thêm mới thành thành công!");
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(error.error.Message);
      }
    });

  }

  handleCateDropdownChange(){
    this.dialog.selectedProduct = null;
    this.dialog.quantity = null,
    this.dialog.price = null,
    this.dialog.filtedProductList = this.products.filter(p => p.category.id === this.dialog.selectedCategory.id);
  }

  handleProductDropdownChange() {
    this.dialog.quantity = null;
    this.dialog.price = this.dialog.selectedProduct.price;
  }

  handleAddProduct2Bill(){
    if(!this.dialog.selectedCategory){
      this.toastService.showError("Vui lòng chọn category!");
      return;
    }

    if(!this.dialog.selectedProduct){
      this.toastService.showError("Vui lòng chọn product!");
      return;
    }

    if(!this.dialog.quantity){
      this.toastService.showError("Quantity không được để trống")
      return;
    }else if(this.dialog.quantity < 1){
      this.toastService.showError("Quantity không được bé hơn 1!")
      return;
    }

    const productDetail : IProductDetails = {
      id: this.dialog.selectedProduct.id,
      productName: this.dialog.selectedProduct.productName,
      categoryName: this.dialog.selectedProduct.category.categoryName,
      price : this.dialog.selectedProduct.price,
      quantity : this.dialog.quantity,
      totalSubPrice() : number {
        return this.price! * this.quantity;
      }
    }
    const idx = this.dialog.productDetailsList.findIndex(p => p.id === productDetail.id);
    if(idx !== -1){
      this.dialog.productDetailsList[idx].quantity += productDetail.quantity
    }else{
      this.dialog.productDetailsList.push(productDetail);
    }
    this.dialog.total += productDetail.totalSubPrice();
  }

  confirmRemoveProductDetail(event: any, producctDetail : IProductDetails){
    console.log('Delete product out of bill', producctDetail);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to remove this product?',
      header: 'Remove Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => {
        this.dialog.total -= producctDetail.totalSubPrice();
        this.dialog.productDetailsList = this.dialog.productDetailsList.filter(p => p.id !== producctDetail.id);
      },
    });
  }

  viewPdfBill(bill:any) {
    window.open(`${this.staticFilePdfUrl}/${bill.guid}.pdf`, '_blank');
  }

  confirmDeleteBill(event: any, bill : any){
    console.log('Delete bill', bill);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this bill?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",

      accept: () => {
        this.billService.deleteBill(bill.id).subscribe({
          next: (res) => {
            console.log(res);
            this.supabaseService.deleteBill(bill.id);
            this.initBills();
            this.toastService.showSucces("Xóa hóa đơn thành công!");
          },
          error: (error) => {
            console.log(error);
            this.toastService.showError(error.error.Message);
          }
        })
      },
    });
  }
}
