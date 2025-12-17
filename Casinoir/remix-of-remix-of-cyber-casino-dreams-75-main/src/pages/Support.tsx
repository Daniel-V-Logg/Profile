
import { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Support = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Register' button in the top navigation bar. Fill in your details, verify your email address, and you're ready to play!"
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods including credit/debit cards, e-wallets like PayPal and Skrill, and cryptocurrency options like Bitcoin and Ethereum."
    },
    {
      question: "How long do withdrawals take?",
      answer: "Withdrawal times depend on your chosen method. E-wallets typically process within 24 hours, card withdrawals take 2-5 business days, and crypto withdrawals are usually processed within an hour."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use advanced encryption technology to protect all personal and financial information. Your data is never shared with third parties without your consent."
    },
    {
      question: "What are the wagering requirements for bonuses?",
      answer: "Wagering requirements vary by promotion. Typically, bonus funds must be wagered 35x before withdrawal. Please check the terms and conditions of each specific bonus for details."
    },
    {
      question: "What if I have a gambling problem?",
      answer: "We take responsible gambling seriously. You can set deposit limits, time limits, or self-exclude through your account settings. We also provide links to gambling support organizations on our Responsible Gambling page."
    }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Your message has been sent. We will get back to you soon!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-cyber text-4xl md:text-5xl mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-cyan">
              Support Center
            </span>
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our customer support team.
            We're here to help 24/7.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div>
            <h2 className="font-cyber text-2xl mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Contact Form */}
          <div>
            <h2 className="font-cyber text-2xl mb-6">Contact Us</h2>
            <div className="cyber-card p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="bg-background/50 min-h-[120px]"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full btn-cyber"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-cyber text-lg mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@casinoir.com</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 24/7 via the chat icon</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
