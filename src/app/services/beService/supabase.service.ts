import { Injectable } from "@angular/core";
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { ConfigStateService } from "../../shared/app-state/config-state.service";

// Channel
const ONLINE_TRACKING_CHANNEL = 'online-tracking';

// Table
const CATEGORY_TABLE = 'Category';
const PRODUCT_TABLE = 'Product';
const BILL_TABLE = 'Bill';
const BILL_PRODUCT_TABLE = 'BillProduct';
const USER_TABLE = 'User';
// Interface
interface IProductEntity {
  id : number,
  productName: string,
  description: string,
  price: number,
  status: number,
  active: boolean,
  userId: number,
categoryId: number
}
interface ICategoryEntity {
  id: number,
  categoryName: string,
  userId: number
}

interface IBillEnttiy {
  id: number,
  creationDate: string,
  paymentMethodId: number,
  userId: number
  totalPrice: number,
  productDetails ?: any;
}

interface IUserForUpdateEntity {
  id: number,
  fullname: string,
  email : string,
  gender : string,
  birthday : string,
  roleId : number,
}

interface IPasswordForUpdateEntity {
  id: number,
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseClient !: SupabaseClient;
  private supabaseUrl : string = '';
  private supabaseKey : string = '';
  private trackingChannel !: RealtimeChannel;

  constructor(private configService : ConfigStateService) {
    this.configService.subscribe((m) => {
      this.supabaseUrl = m.supabaseUrl;
      this.supabaseKey = m.supabaseKey;
      this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey);
      console.log(this.supabaseClient);
    })
  }
  // CATEGORY
  async getCategories(){
    const {data} = await this.supabaseClient.from(CATEGORY_TABLE).select('*');
    return data;
  }

  async insertCategory(categoryEntity : ICategoryEntity){
    const {data} = await this.supabaseClient.from(CATEGORY_TABLE).insert(categoryEntity).select();
    return data ? data[0] : {};
  }

  async updateCategory(categoryEntity : Partial<ICategoryEntity>){
    const {data} = await this.supabaseClient.from(CATEGORY_TABLE).update(categoryEntity).eq('id', categoryEntity.id).select();
    return data ? data[0] : {};
  }

  async delelteCategory(categoryId : number){
    const {data} = await this.supabaseClient.from(CATEGORY_TABLE).delete().eq('id', categoryId);

    return data ? data[0] : {};
  }

  // PRODUCT
  async getProducts(){
    const {data} = await this.supabaseClient.from(PRODUCT_TABLE).select('*');

    return data;
  }

  async insertProduct(productEntity: IProductEntity){
    const {data} = await this.supabaseClient.from(PRODUCT_TABLE).insert(productEntity).select();
    return data ? data[0] : {};
  }

  async updateProduct(productEntity: Partial<IProductEntity>){
    const {data} = await this.supabaseClient.from(PRODUCT_TABLE).update(productEntity).eq('id', productEntity.id).select();

    return data ? data[0] : {};
  }

  async deleteProduct(productId: number){
    const {data} = await this.supabaseClient.from(PRODUCT_TABLE).delete().eq('id', productId).select();
    return data ? data[0] : {};
  }

  // BILL
  async getBills(){
    const {data} =  await this.supabaseClient.from(BILL_TABLE).select('*');
    return data;
  }

  async insertBill(bill: IBillEnttiy){
    const productDetails = bill.productDetails
    delete bill.productDetails;
    const {data} = await this.supabaseClient.from(BILL_TABLE).insert(bill).select();
    await this.insertProductBill(productDetails, bill.id);

    return data ? data[0] : {};
  }
  async deleteBill(billId : number){
    const {data} = await this.supabaseClient.from(BILL_TABLE).delete().eq('id', billId).select();
    return data ? data[0] : {};
  }
  private async insertProductBill(productDetails: any[], billId : number){
    console.log('product details', productDetails);
    for(let product of productDetails){
      await this.supabaseClient.from(BILL_PRODUCT_TABLE).insert({
        billId: billId,
        productId : product.id,
        quantity : product.quantity
      })
    }
  }
    // User
    async updateUser(userForUpdate : IUserForUpdateEntity){
      const {data} = await this.supabaseClient.from(USER_TABLE).update(userForUpdate).eq('id', userForUpdate.id).select();

      return data ? data[0] : {};
    }
    async updateUserPassword(passwrdForUpdate: IPasswordForUpdateEntity){
      const {data} = await this.supabaseClient.from(USER_TABLE).update(passwrdForUpdate).eq('id', passwrdForUpdate.id).select();

      return data ? data[0] : {};
    }

  // SUBSCRIPTION
  subscribeTrackingChannel(user : any, presenceSyncCb: (presenceState : any) => void) {
    this.trackingChannel = this.supabaseClient.channel(ONLINE_TRACKING_CHANNEL, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    this.trackingChannel.on('presence', {event: 'sync'}, () => {
      const newState = this.trackingChannel.presenceState();
      console.log('sync', newState);
      presenceSyncCb(newState);
    }).subscribe(async (status) => {
      if(status === 'SUBSCRIBED'){
        await this.trackingChannel.track({user});
      }
    })
  }

  subscribeCategoryTable(callback: (payload:any) => void){
    this.supabaseClient.channel(`public:${CATEGORY_TABLE}`).on('postgres_changes', {event: '*', schema: 'public', table: `${CATEGORY_TABLE}`},(payload:any) => {
      callback(payload)
    }).subscribe();
  }

  subscribeProductTable(callback: (payload:any) => void){
    this.supabaseClient.channel(`public:${PRODUCT_TABLE}`).on('postgres_changes', {event: '*', schema: 'public', table: `${PRODUCT_TABLE}`}, (payload: any) => {
      callback(payload);
    }).subscribe();
  }

  // subscribeBillProductTable(callback: (payload:any) => void){
  //   this.supabaseClient.channel(`public:${BILL_PRODUCT_TABLE}`).on(`postgres_changes`, {event: '*', schema: 'public', table: `${BILL_PRODUCT_TABLE}`}, (payload : any) =>{
  //     callback(payload);
  //   }).subscribe();
  // }

  subscribeBillTable(callback: (payload:any) => void){
    this.supabaseClient.channel(`public:${BILL_TABLE}`).on(`postgres_changes`, {event: '*', schema: 'public', table: `${BILL_TABLE}`}, (payload : any) => {
      callback(payload);
    }).subscribe();
  }

  unsubscribeTrackingChannel(){
    console.log("Unsubscribe tracking channel called!");
    this.trackingChannel?.unsubscribe();
  }


  // STATISTIC
  async getRevenueStatisticByYear(year: number){
    const {data} = await this.supabaseClient.rpc('get_revenue_sta_by_year', {'year': year}).select('*');
    return data;
  }

  async getBestSellers(){
    const {data} = await this.supabaseClient.rpc('get_best_sellers').select('*');

    return data;
  }
}
