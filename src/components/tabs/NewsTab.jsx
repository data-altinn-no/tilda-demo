import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Calendar, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';

/**
 * NewsTab Component - Displays recent news articles about the organization
 */
export function NewsTab({ orgDetails, organizationNumber }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    if (!orgDetails?.name && !organizationNumber) {
      setError('Ingen organisasjonsinformasjon tilgjengelig');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search query - use organization name if available, otherwise org number
      const searchQuery = orgDetails?.name || organizationNumber;
      
      // Using a news API - you can replace this with your preferred news API
      // For demo purposes, I'll create mock news data
      // In production, you would call: await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=no&sortBy=publishedAt&apiKey=YOUR_API_KEY`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock news data
      const mockNews = [
        {
          id: 1,
          title: `${searchQuery} lanserer ny bærekraftstrategi`,
          description: 'Selskapet har annonsert en omfattende plan for å redusere karbonavtrykket med 50% innen 2030. Strategien inkluderer investeringer i fornybar energi og grønne teknologier.',
          source: 'E24',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://e24.no',
          urlToImage: null
        },
        {
          id: 2,
          title: `Sterke resultater for ${searchQuery} i tredje kvartal`,
          description: 'Kvartalsrapporten viser en omsetningsvekst på 15% sammenlignet med samme periode i fjor. Ledelsen er optimistiske for fremtiden.',
          source: 'Dagens Næringsliv',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://dn.no',
          urlToImage: null
        },
        {
          id: 3,
          title: `${searchQuery} inngår strategisk partnerskap`,
          description: 'Det nye partnerskapet skal styrke selskapets posisjon i det nordiske markedet og åpne for nye vekstmuligheter.',
          source: 'NTB',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://ntb.no',
          urlToImage: null
        },
        {
          id: 4,
          title: `Ansetter 50 nye medarbeidere hos ${searchQuery}`,
          description: 'Som en del av vekststrategien utvider selskapet nå bemanningen betydelig. Stillingene er innen teknologi, salg og kundeservice.',
          source: 'Aftenposten',
          publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://aftenposten.no',
          urlToImage: null
        },
        {
          id: 5,
          title: `${searchQuery} vinner prestisjetung bransjepreis`,
          description: 'Prisen ble tildelt for innovativ bruk av teknologi og fremragende kundeservice. Dette er tredje gang selskapet mottar denne utmerkelsen.',
          source: 'Finansavisen',
          publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://finansavisen.no',
          urlToImage: null
        }
      ];

      setNews(mockNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Kunne ikke hente nyheter. Vennligst prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [orgDetails, organizationNumber]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    if (diffDays < 7) return `${diffDays} dager siden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} uker siden`;
    
    return date.toLocaleDateString('nb-NO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Nyheter om {orgDetails?.name || organizationNumber}
          </CardTitle>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            title="Oppdater nyheter"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Siste nyhetsartikler og pressemeldinger relatert til organisasjonen
        </p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
            <p className="text-neutral-600">Henter nyheter...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Kunne ikke hente nyheter</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Newspaper className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-900 mb-2">Ingen nyheter funnet</h4>
            <p className="text-sm text-blue-700">
              Det er ingen nyhetsartikler tilgjengelig for denne organisasjonen for øyeblikket.
            </p>
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="space-y-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="digdir-card p-5 hover:shadow-md transition-shadow border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary-100 text-primary-800 text-xs">
                        {article.source}
                      </Badge>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Les mer
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-600">
              <strong>Merk:</strong> Nyhetsartiklene vises for demonstrasjonsformål. 
              I produksjon vil dette integreres med en ekte nyhets-API for å hente faktiske artikler fra norske medier.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
