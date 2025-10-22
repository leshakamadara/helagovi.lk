import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Send, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/axios';
import SimpleHeader from '@/components/SimpleHeader';

const EmailTester = () => {
  const [emailType, setEmailType] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Custom email fields
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [fromName, setFromName] = useState('Helagovi.lk');

  // Promotional email fields
  const [promoTitle, setPromoTitle] = useState('Special Offer Just for You!');
  const [promoDescription, setPromoDescription] = useState('Discover amazing deals and exclusive offers on our platform.');
  const [discountCode, setDiscountCode] = useState('WELCOME20');
  const [discountValue, setDiscountValue] = useState('20%');
  const [promoCtaText, setPromoCtaText] = useState('Shop Now');

  // Join us email fields
  const [joinTitle, setJoinTitle] = useState('Join the Helagovi.lk Community!');
  const [joinMessage, setJoinMessage] = useState('Be part of Sri Lanka\'s growing agricultural marketplace.');
  const [joinBenefits, setJoinBenefits] = useState('Connect directly with farmers,Access fresh, local produce,Support sustainable agriculture,Build your business network');
  const [joinCtaText, setJoinCtaText] = useState('Join Now');

  const emailTypes = [
    { value: 'verification', label: 'Verification Email', description: 'Account verification with logo and expiration notice' },
    { value: 'ticket', label: 'Ticket Confirmation', description: 'Support ticket creation confirmation' },
    { value: 'promotional', label: 'Promotional Email', description: 'Marketing email with discount offers' },
    { value: 'join-us', label: 'Join Us Email', description: 'Community invitation and benefits' },
    { value: 'custom', label: 'Custom Email', description: 'Fully customizable email content' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let endpoint = `/email/test/${emailType}`;
      let payload = { email, firstName };

      switch (emailType) {
        case 'promotional':
          payload = {
            ...payload,
            title: promoTitle,
            description: promoDescription,
            discountCode,
            discountValue,
            ctaText: promoCtaText
          };
          break;
        case 'join-us':
          payload = {
            ...payload,
            title: joinTitle,
            message: joinMessage,
            benefits: joinBenefits.split(',').map(b => b.trim()),
            ctaText: joinCtaText
          };
          break;
        case 'custom':
          payload = {
            email,
            subject: customSubject,
            htmlContent: customContent,
            fromName
          };
          break;
      }

      const response = await api.post(endpoint, payload);
      setResult({ success: true, message: response.data.message, email: response.data.email });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Failed to send email',
        details: error.response?.data?.details
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEmailFields = () => {
    switch (emailType) {
      case 'promotional':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="promoTitle">Email Title</Label>
              <Input
                id="promoTitle"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Special Offer Just for You!"
              />
            </div>
            <div>
              <Label htmlFor="promoDescription">Description</Label>
              <Textarea
                id="promoDescription"
                value={promoDescription}
                onChange={(e) => setPromoDescription(e.target.value)}
                placeholder="Describe the promotional offer..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountCode">Discount Code</Label>
                <Input
                  id="discountCode"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="WELCOME20"
                />
              </div>
              <div>
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="20%"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="promoCtaText">Call-to-Action Text</Label>
              <Input
                id="promoCtaText"
                value={promoCtaText}
                onChange={(e) => setPromoCtaText(e.target.value)}
                placeholder="Shop Now"
              />
            </div>
          </div>
        );

      case 'join-us':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="joinTitle">Email Title</Label>
              <Input
                id="joinTitle"
                value={joinTitle}
                onChange={(e) => setJoinTitle(e.target.value)}
                placeholder="Join the Helagovi.lk Community!"
              />
            </div>
            <div>
              <Label htmlFor="joinMessage">Message</Label>
              <Textarea
                id="joinMessage"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Invitation message..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="joinBenefits">Benefits (comma-separated)</Label>
              <Textarea
                id="joinBenefits"
                value={joinBenefits}
                onChange={(e) => setJoinBenefits(e.target.value)}
                placeholder="Benefit 1, Benefit 2, Benefit 3"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="joinCtaText">Call-to-Action Text</Label>
              <Input
                id="joinCtaText"
                value={joinCtaText}
                onChange={(e) => setJoinCtaText(e.target.value)}
                placeholder="Join Now"
              />
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Helagovi.lk"
              />
            </div>
            <div>
              <Label htmlFor="customSubject">Subject</Label>
              <Input
                id="customSubject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Your email subject"
                required
              />
            </div>
            <div>
              <Label htmlFor="customContent">HTML Content</Label>
              <Textarea
                id="customContent"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="<p>Your custom HTML content here...</p>"
                rows={8}
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Email Tester</h1>
        <p className="text-sm sm:text-base text-gray-600">Test different types of emails with professional templates</p>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Select an email type and enter the recipient details to send a test email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Type Selection */}
            <div>
              <Label htmlFor="emailType">Email Type</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  {emailTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              {emailType !== 'custom' && (
                <div>
                  <Label htmlFor="firstName">Recipient Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Test User"
                  />
                </div>
              )}
            </div>

            {/* Dynamic Fields */}
            {renderEmailFields()}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !emailType || !email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </form>

          {/* Result Alert */}
          {result && (
            <Alert className={`mt-6 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                <div className="font-medium">{result.message}</div>
                {result.email && <div className="text-sm mt-1">Sent to: {result.email}</div>}
                {result.details && <div className="text-sm mt-1 text-red-600">{result.details}</div>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Types Info */}
      <Card className="mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle>Email Types Available</CardTitle>
          <CardDescription>Overview of different email templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {emailTypes.map((type) => (
              <div key={type.value} className="p-3 sm:p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{type.label}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default EmailTester;