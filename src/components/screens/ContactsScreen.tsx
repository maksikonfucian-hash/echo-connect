import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContactCard } from '@/components/ContactCard';
import { User } from '@/types/app';
import { mockContacts } from '@/data/mockContacts';
import { Search, Share2, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactsScreenProps {
  onCall: (contact: User) => void;
  onLogout: () => void;
}

export function ContactsScreen({ onCall, onLogout }: ContactsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineContacts = filteredContacts.filter(c => c.status === 'online');
  const offlineContacts = filteredContacts.filter(c => c.status !== 'online');

  const handleInvite = () => {
    // Открытие Telegram Share Link
    const shareText = 'Присоединяйся к VoiceCall для аудиозвонков!';
    const shareUrl = 'https://t.me/voicecall_app';
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Контакты</h1>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск контактов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Online Section */}
        {onlineContacts.length > 0 && (
          <section className="mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-online" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Онлайн ({onlineContacts.length})
              </h2>
            </div>
            <div className="space-y-3">
              {onlineContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ContactCard contact={contact} onCall={onCall} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Offline Section */}
        {offlineContacts.length > 0 && (
          <section className="mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-offline" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Не в сети ({offlineContacts.length})
              </h2>
            </div>
            <div className="space-y-3">
              {offlineContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(onlineContacts.length + index) * 50}ms` }}
                >
                  <ContactCard contact={contact} onCall={onCall} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">Контакты не найдены</p>
            <p className="text-sm text-muted-foreground/70">Попробуйте изменить поисковый запрос</p>
          </div>
        )}
      </main>

      {/* Footer - Invite Button */}
      <footer className="sticky bottom-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          onClick={handleInvite}
          variant="outline"
          size="lg"
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Share2 className="mr-2 w-5 h-5" />
          Пригласить друзей
        </Button>
      </footer>
    </div>
  );
}
