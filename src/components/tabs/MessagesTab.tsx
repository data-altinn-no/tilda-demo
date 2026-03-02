import { useState, useMemo, useEffect } from 'react';
import { Mail, Send, Inbox, ChevronDown, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AUTHORITIES, MESSAGE_TYPES } from '../../constants';
import { genSendteMeldingerFor } from '../../data/generators';

interface SentMessage {
  id: string;
  type: string;
  recipient: string;
  message: string;
  tilsynsobjekt: string;
  timestamp: Date;
  status: string;
}

interface MessagesTabProps {
  meldinger: any[];
  generatedFor: string;
  fromDate: string | null;
  toDate: string | null;
  organizationNumber: string;
}

/**
 * Messages Tab Component - Displays messages with sub-tabs for received and sent
 */
export function MessagesTab({ meldinger, generatedFor, fromDate, toDate, organizationNumber }: MessagesTabProps) {
  const [activeTab, setActiveTab] = useState<'mottatte' | 'sendte' | 'ny-melding'>('mottatte');
  const [selectedMessageAuthority, setSelectedMessageAuthority] = useState<string | null>(null);
  
  // Generate sent messages based on date range
  const generatedSentMessages = useMemo(() => {
    if (!generatedFor) return [];
    return genSendteMeldingerFor(generatedFor, fromDate, toDate);
  }, [generatedFor, fromDate, toDate]);
  
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  
  // Update sent messages when generated data changes
  useEffect(() => {
    setSentMessages(generatedSentMessages);
  }, [generatedSentMessages]);
  
  // Get unique authorities from message data
  const messageAuthorities = useMemo(() => {
    const authorities = new Set();
    
    // Add authorities from received messages (senders)
    meldinger.forEach(m => {
      if (m.mottaker) authorities.add(m.mottaker);
    });
    
    // Add authorities from sent messages (recipients)
    sentMessages.forEach(m => {
      if (m.recipient) authorities.add(m.recipient);
    });
    
    return Array.from(authorities).sort((a, b) => a.localeCompare(b, 'no'));
  }, [meldinger, sentMessages]);
  
  const [sendForm, setSendForm] = useState({
    type: '',
    recipient: '',
    message: '',
    tilsynsobjekt: organizationNumber || ''
  });

  // Update tilsynsobjekt when organizationNumber changes
  useEffect(() => {
    setSendForm(prev => ({ ...prev, tilsynsobjekt: organizationNumber || '' }));
  }, [organizationNumber]);

  const handleSendMessage = () => {
    if (!sendForm.type || !sendForm.recipient || !sendForm.message.trim()) {
      return; // Don't send if required fields are empty
    }

    const newMessage = {
      id: Date.now().toString(),
      type: sendForm.type,
      recipient: sendForm.recipient,
      message: sendForm.message,
      tilsynsobjekt: sendForm.tilsynsobjekt,
      timestamp: new Date(),
      status: 'sent'
    };

    setSentMessages(prev => [newMessage, ...prev]);
    setSendForm({ type: '', recipient: '', message: '', tilsynsobjekt: organizationNumber || '' });
  };

  const renderTabButton = (tabId: 'mottatte' | 'sendte' | 'ny-melding', label: string, icon: React.ReactNode) => (
    <button
      key={tabId}
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tabId
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const getMeldingTypeColor = (type: string): string => {
    switch(type) {
      case 'varsel-om-rapport': return 'bg-blue-100 text-blue-800';
      case 'varsel-om-koordinering': return 'bg-green-100 text-green-800';
      case 'varsel-fritekst': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex gap-2">
            {renderTabButton('mottatte', `Mottatte (${selectedMessageAuthority ? meldinger.filter(m => m.mottaker === selectedMessageAuthority).length : meldinger.length})`, <Inbox className="w-4 h-4" />)}
            {renderTabButton('sendte', `Sendte (${selectedMessageAuthority ? sentMessages.filter(m => m.recipient === selectedMessageAuthority).length : sentMessages.length})`, <Send className="w-4 h-4" />)}
            {renderTabButton('ny-melding', 'Ny melding', <Plus className="w-4 h-4" />)}
          </div>
          {messageAuthorities.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedMessageAuthority || ''}
                  onChange={(e) => setSelectedMessageAuthority(e.target.value || null)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
                >
                  <option value="">Alle myndigheter</option>
                  {(messageAuthorities as string[]).map(authority => (
                    <option key={authority} value={authority}>{authority}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              {selectedMessageAuthority && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedMessageAuthority(null)}
                  className="text-xs px-2 py-1"
                >
                  Fjern filter
                </Button>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {activeTab === 'mottatte' && (
          <>
            {meldinger.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Inbox className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Ingen mottatte meldinger</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                <div className="text-sm text-gray-600 mb-2">
                  Viser {selectedMessageAuthority ? meldinger.filter(m => m.mottaker === selectedMessageAuthority).length : meldinger.length} mottatte meldinger
                </div>
                {(selectedMessageAuthority ? meldinger.filter(m => m.mottaker === selectedMessageAuthority) : meldinger)
                  .sort((a, b) => new Date(b.datoForMeldingTilAnnenMyndighet).getTime() - new Date(a.datoForMeldingTilAnnenMyndighet).getTime())
                  .map((melding) => {
                  const meldingDate = new Date(melding.datoForMeldingTilAnnenMyndighet);
                  return (
                    <Card key={melding.identifikator} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Inbox className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="font-medium text-sm">{melding.identifikator}</div>
                              <div className="text-xs text-gray-500">{formatDate(meldingDate)}</div>
                            </div>
                          </div>
                          <Badge className={getMeldingTypeColor(melding.meldingsinnholdTilAnnenMyndighet.meldingsType)}>
                            {melding.meldingsinnholdTilAnnenMyndighet.meldingsType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Fra</span>
                            <span className="font-medium text-gray-900">{melding.mottaker}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Tilda-enhet</span>
                            <span className="font-medium text-gray-900">{melding.meldingOmTildaenhet}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg border-l-4 border-blue-200 text-gray-700 text-sm leading-relaxed italic">
                          "{melding.meldingsinnholdTilAnnenMyndighet.fritekst}"
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'sendte' && (
          <div>
            <div className="text-sm text-gray-600 mb-4">
              Viser {selectedMessageAuthority ? sentMessages.filter(m => m.recipient === selectedMessageAuthority).length : sentMessages.length} sendte meldinger
            </div>
            
            {(selectedMessageAuthority ? sentMessages.filter(m => m.recipient === selectedMessageAuthority) : sentMessages).length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Send className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Ingen sendte meldinger ennå</p>
                  <p className="text-sm text-gray-500 mt-1">Gå til "Ny melding" for å sende en melding</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(selectedMessageAuthority ? sentMessages.filter(m => m.recipient === selectedMessageAuthority) : sentMessages).map((message) => (
                  <Card key={message.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Send className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="font-medium text-sm">MSG-{message.id.slice(-6)}</div>
                            <div className="text-xs text-gray-500">{formatDate(message.timestamp)}</div>
                          </div>
                        </div>
                        <Badge className={getMeldingTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Til</span>
                          <span className="font-medium text-gray-900">{message.recipient}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Tilda-enhet</span>
                          <span className="font-medium text-gray-900">{message.tilsynsobjekt || 'Ikke angitt'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Status</span>
                          <span className="font-medium text-green-600">Sendt</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border-l-4 border-green-200 text-gray-700 text-sm leading-relaxed">
                        {message.message}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ny-melding' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Send ny melding
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Message Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meldingstype
                  </label>
                  <div className="relative">
                    <select
                      value={sendForm.type}
                      onChange={(e) => setSendForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="">Velg meldingstype...</option>
                      {MESSAGE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Recipient Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mottaker
                  </label>
                  <div className="relative">
                    <select
                      value={sendForm.recipient}
                      onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="">Velg mottaker...</option>
                      {[...AUTHORITIES].sort((a, b) => a.localeCompare(b, 'no')).map(authority => (
                        <option key={authority} value={authority}>{authority}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Tilda-enhet Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tilda-enhet
                </label>
                <input
                  type="text"
                  value={sendForm.tilsynsobjekt}
                  onChange={(e) => setSendForm(prev => ({ ...prev, tilsynsobjekt: e.target.value }))}
                  placeholder="Organisasjonsnummer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Message Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Melding
                </label>
                <textarea
                  value={sendForm.message}
                  onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Skriv din melding her..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>

              {/* Send Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Meldingen vil bli lagt til i "Sendte" etter sending
                </div>
                <Button
                  onClick={() => {
                    handleSendMessage();
                    setActiveTab('sendte'); // Switch to sent tab after sending
                  }}
                  disabled={!sendForm.type || !sendForm.recipient || !sendForm.message.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send melding
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}