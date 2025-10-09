import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { H1, P, Muted } from '../../components/ui/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { CreditCard, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const addCard = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  //  Pre-fill form with user data
  useEffect(() => {
    if (!user) {
      setMessage("Please log in to add a card");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [user, navigate]);

  const handlePreapprove = async () => {
    if (!user || !user._id) {
      setMessage("User not authenticated. Please log in.");
      return;
    }

    // Enhanced Validation
    const errors = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Invalid email format";
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?\d{9,15}$/.test(phone.replace(/\s+/g, ''))) {
      errors.phone = "Invalid phone number format";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMessage("Please fix the errors above");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      console.log("Initiating preapproval for user:", user._id);

      const response = await api.post("/payments/preapprove", {
        userId: user._id || user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address: "",
        city: "",
      });

      const data = response.data;
      console.log("Preapproval response:", data);
      if (data.url && data.params) {
        const form = document.createElement("form");
        form.action = data.url;
        form.method = "POST";

        for (const key in data.params) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.params[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        setMessage("Preapproval request failed. Please try again.");
      }
    } catch (err) {
      console.error("Preapproval error:", err);
      setMessage("Error initiating preapproval. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/buyer-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/CardManagementPage">Payment Cards</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add New Card</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <H1 className="text-gray-900">Add Payment Card</H1>
            <P className="text-gray-600">Securely save your card for future automated payments</P>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Card Pre-approval
            </CardTitle>
            <CardDescription>
              Securely save your card for future automated payments through PayHere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Safe & Secure</AlertTitle>
              <AlertDescription>
                Your payment information is encrypted and processed securely through PayHere.
              </AlertDescription>
            </Alert>

            {/* Form */}
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                  {formErrors.firstName && (
                    <span className="text-red-600 text-xs">{formErrors.firstName}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                  {formErrors.lastName && (
                    <span className="text-red-600 text-xs">{formErrors.lastName}</span>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {formErrors.email && (
                  <span className="text-red-600 text-xs">{formErrors.email}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
                {formErrors.phone && (
                  <span className="text-red-600 text-xs">{formErrors.phone}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                  onClick={handlePreapprove}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Preapprove Card
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <Alert variant={message.includes('failed') || message.includes('Error') ? 'destructive' : 'default'}>
                {message.includes('failed') || message.includes('Error') ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {message.includes('failed') || message.includes('Error') ? 'Error' : 'Success'}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default addCard;
