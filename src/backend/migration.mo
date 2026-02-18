import Stripe "stripe/stripe";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    products : Map.Map<Text, {
      id : Text;
      name : Text;
      priceInCents : Nat;
      currency : Text;
      description : Text;
      image : Storage.ExternalBlob;
    }>;
    configuration : ?Stripe.StripeConfiguration;
  };

  type PaymentMethodOptions = {
    allowCreditCards : Bool;
    allowCryptoPayments : Bool;
    allowCashApp : Bool;
    allowDirectDebit : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    products : Map.Map<Text, {
      id : Text;
      name : Text;
      priceInCents : Nat;
      currency : Text;
      description : Text;
      image : Storage.ExternalBlob;
    }>;
    stripeConfiguration : ?Stripe.StripeConfiguration;
    paymentMethodOptions : PaymentMethodOptions;
  };

  public func run(previous : OldActor) : NewActor {
    {
      previous with
      stripeConfiguration = previous.configuration;
      paymentMethodOptions = {
        allowCreditCards = true;
        allowCryptoPayments = false;
        allowCashApp = false;
        allowDirectDebit = false;
      };
    };
  };
};
