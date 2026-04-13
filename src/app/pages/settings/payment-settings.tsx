import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ArrowLeft, Save, Wallet, CreditCard, Smartphone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";

export function PaymentSettings() {
  const navigate = useNavigate();
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [netBankingEnabled, setNetBankingEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(false);

  const handleSave = () => {
    toast.success("Payment settings saved successfully!");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-rose-600" />
            Payment Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure payment providers and modes
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Payment Gateway */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateway</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Payment Gateway</Label>
              <Select defaultValue="razorpay">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="paytm">Paytm</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="cashfree">Cashfree</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter API key"
                  defaultValue="rzp_test_**********************"
                />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  placeholder="Enter secret key"
                  defaultValue="**********************"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Test Mode Active
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Currently using test credentials. Switch to production keys before going live.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modes */}
        <Card>
          <CardHeader>
            <CardTitle>Accepted Payment Modes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* UPI */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex gap-4 flex-1">
                <div className="bg-purple-100 p-3 rounded-lg h-fit">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">UPI</h4>
                    {upiEnabled && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Google Pay, PhonePe, Paytm, and other UPI apps
                  </p>
                  {upiEnabled && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Google Pay</Badge>
                      <Badge variant="secondary">PhonePe</Badge>
                      <Badge variant="secondary">Paytm</Badge>
                      <Badge variant="secondary">BHIM</Badge>
                    </div>
                  )}
                </div>
              </div>
              <Switch checked={upiEnabled} onCheckedChange={setUpiEnabled} />
            </div>

            {/* Cards */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex gap-4 flex-1">
                <div className="bg-blue-100 p-3 rounded-lg h-fit">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Credit/Debit Cards</h4>
                    {cardEnabled && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Visa, Mastercard, RuPay, and American Express
                  </p>
                  {cardEnabled && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Visa</Badge>
                      <Badge variant="secondary">Mastercard</Badge>
                      <Badge variant="secondary">RuPay</Badge>
                      <Badge variant="secondary">Amex</Badge>
                    </div>
                  )}
                </div>
              </div>
              <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
            </div>

            {/* Net Banking */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex gap-4 flex-1">
                <div className="bg-green-100 p-3 rounded-lg h-fit">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Net Banking</h4>
                    {netBankingEnabled && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    All major banks supported
                  </p>
                  {netBankingEnabled && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">SBI</Badge>
                      <Badge variant="secondary">HDFC</Badge>
                      <Badge variant="secondary">ICICI</Badge>
                      <Badge variant="secondary">Axis</Badge>
                      <Badge variant="secondary">+50 more</Badge>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                checked={netBankingEnabled}
                onCheckedChange={setNetBankingEnabled}
              />
            </div>

            {/* Wallets */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex gap-4 flex-1">
                <div className="bg-amber-100 p-3 rounded-lg h-fit">
                  <Wallet className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Digital Wallets</h4>
                    {walletEnabled && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Paytm Wallet, Amazon Pay, and more
                  </p>
                  {walletEnabled && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Paytm</Badge>
                      <Badge variant="secondary">Amazon Pay</Badge>
                      <Badge variant="secondary">Mobikwik</Badge>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                checked={walletEnabled}
                onCheckedChange={setWalletEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Payment Terms</Label>
              <Select defaultValue="immediate">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate Payment</SelectItem>
                  <SelectItem value="net7">Net 7 Days</SelectItem>
                  <SelectItem value="net15">Net 15 Days</SelectItem>
                  <SelectItem value="net30">Net 30 Days</SelectItem>
                  <SelectItem value="net45">Net 45 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Credit Limit (₹)</Label>
              <Input
                type="number"
                placeholder="Enter credit limit"
                defaultValue="100000"
              />
              <p className="text-xs text-gray-500">
                Maximum outstanding amount allowed per customer
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Settlement Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Settlement Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Settlement Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant (T+0)</SelectItem>
                  <SelectItem value="daily">Daily (T+1)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bank Account Number</Label>
              <Input
                placeholder="Enter account number"
                defaultValue="****7890"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input placeholder="Enter IFSC code" defaultValue="HDFC0001234" />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input
                  placeholder="Enter name"
                  defaultValue="ABC Distributors Pvt Ltd"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">UPI</p>
                <p className="text-xs text-gray-600">Per transaction</p>
              </div>
              <span className="font-semibold text-gray-700">Free</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Credit/Debit Cards</p>
                <p className="text-xs text-gray-600">Per transaction</p>
              </div>
              <span className="font-semibold text-gray-700">1.8% + GST</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Net Banking</p>
                <p className="text-xs text-gray-600">Per transaction</p>
              </div>
              <span className="font-semibold text-gray-700">₹15 + GST</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Wallets</p>
                <p className="text-xs text-gray-600">Per transaction</p>
              </div>
              <span className="font-semibold text-gray-700">2.0% + GST</span>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
