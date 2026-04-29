import AntDesign from '@expo/vector-icons/AntDesign';
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, InteractionManager, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

function initialScreen({ navigation }) {
    const fontePlayfairBold = { fontFamily: 'PlayfairDisplay-Bold' };

    function getFlagUrl(code) {
        const map = {
            USD: 'us',
            BRLT: 'br',
            EUR: 'eu',
            GBP: 'gb',
            ARS: 'ar',
            BTC: 'btc',
            LTC: 'ltc',
            JPY: 'jp',
            CHF: 'ch',
            AUD: 'au',
            CNY: 'cn',
            ILS: 'il',
            ETH: 'eth',
            XRP: 'xrp',
            DOGE: 'doge',
            BRL: 'br',
            CAD: 'ca'
        };
        const country = map[code];
        if (!country) return null;
        return `https://flagcdn.com/w80/${country}.png`;
    }

    const [cotacoes, setCotacoes] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('--:--');
    const [loading, setLoading] = useState(false);

    function formatBrl(value) {
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            return 'R$ --';
        }
        return numberValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatTime(value) {
        if (!value) {
            return '--:--';
        }
        const parsedDate = new Date(value.replace(' ', 'T'));
        if (Number.isNaN(parsedDate.getTime())) {
            return '--:--';
        }
        return parsedDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatVariation(value) {
        const numberValue = Number(value);

        if (Number.isNaN(numberValue)) {
            return '0,00%';
        }

        const absoluteFormatted = Math.abs(numberValue).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (numberValue > 0) {
            return <Text style={{ color: 'green', fontSize: 15 }}>+{absoluteFormatted}%</Text>;
        }

        if (numberValue < 0) {
            return <Text style={{ color: 'red', fontSize: 15 }}>-{absoluteFormatted}%</Text>;
        }

        return '0,00%';
    }

    function getVariationColor(value) {
        const numberValue = Number(value);

        if (numberValue > 0) {
            return '#2e7d32';
        }

        if (numberValue < 0) {
            return '#c62828';
        }

        return '#6b7280';
    }

    function getVariationIcon(value) {
        const numberValue = Number(value);
        if (numberValue > 0) {
            return <AntDesign name="caret-up" size={20} color="green" />;
        }
        if (numberValue < 0) {
            return <AntDesign name="caret-down" size={20} color="red" />;
        }
        return <AntDesign name="minus" size={20} color="black" />;
    }

    async function atualizaCotacoes() {
        try {
            setLoading(true);
            const response = await api.get();
            const listCotacoes = Object.values(response.data).map((item) => ({
                code: item.code,
                codein: item.codein,
                name: item.name,
                value: item.bid,
                variation: item.pctChange
            }));
            setCotacoes(listCotacoes);
            setLastUpdate(
                new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            );
        } catch (e) {
            console.log('Erro ao atualizar cotações:', e);
        } finally {
            setLoading(false);
        }
    }
    function fazerLogout() {
        const auth = getAuth();
        signOut(auth).then(() => {
            navigation.navigate('login');
        }).catch((e) => {
            const errorCode = e.code;
            const errorMessage = e.message;
            console.log(errorCode, errorMessage);
        });
    }

    useEffect(() => {
        atualizaCotacoes();
    }, []);

    return (
        <View style={{ flex: 1, height: '100%', width: '100%', backgroundColor: '#ffffff', alignItems: 'center' }}> {/* Container Principal */}
            {/* header blue */}
            <View style={{ backgroundColor: '#263466', height: 180, width: '100%', borderBottomRightRadius: 30, borderBottomLeftRadius: 30, alignItems: 'center' }}>
                {/* Header titulo */}
                <View style={{ width: '100%', marginTop: 60, alignItems: 'center' }}>
                    <Text style={[{ color: '#ffffff', fontSize: 34, textAlign: 'center', lineHeight: 34 }, fontePlayfairBold]}>Conversor de</Text>
                    <Text style={[{ color: '#ffffff', fontSize: 34, textAlign: 'center', lineHeight: 34 }, fontePlayfairBold]}>
                        Moedas <Text style={[{ color: '#ff8c00' }, fontePlayfairBold]}>Pro</Text>
                    </Text>
                </View>



            </View>

            <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%' }}>
                {/* Cotacao atual / card 01 */}
                <View style={{ backgroundColor: '#ffffff', width: 340, height: 80, marginTop: 15, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowRadius: 8 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Cotação Atual</Text>
                    <Text style={{ fontSize: 15 }}>Ultima Atualização: {lastUpdate}</Text>
                </View>

                {/* Listagem Cotacoes */}

                {cotacoes.map((item, index) => (
                    <View key={index} style={{ backgroundColor: '#ffffff', width: 340, height: 90, borderRadius: 15, marginTop: 15, shadowRadius: 8 }}>
                        <View style={{ height: 35, width: 35, borderRadius: 20, marginBottom: -25, marginTop: 20, marginLeft: 10, overflow: 'hidden' }}>
                            <Image source={{ uri: getFlagUrl(item.code) }} style={{ width: '100%', height: '100%' }} />
                        </View>
                        <View style={{ height: 35, width: 35, borderRadius: 20, marginLeft: 30, overflow: 'hidden' }}>
                            <Image source={{ uri: getFlagUrl(item.codein) }} style={{ width: '100%', height: '100%' }} />
                        </View>
                        <View style={{ position: 'absolute', left: 83, top: 12, width: 150 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.code}/{item.codein}</Text>
                            <Text style={{ fontSize: 14, textAlign: 'left' }}>{item.name}</Text>
                        </View>
                        <View style={{ position: 'absolute', right: 12, top: 18 }}>
                            <Text style={{ alignItems: 'flex-end', fontSize: 18, fontWeight: 'bold' }}>{formatBrl(item.value)}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 2 }}>
                                <Text style={{ color: getVariationColor(item.variation), fontSize: 13, fontWeight: 'bold', marginRight: 4 }}>{getVariationIcon(item.variation)}</Text>
                                <Text style={{ color: getVariationColor(item.variation), fontSize: 13, fontWeight: 'bold' }}>{formatVariation(item.variation)}</Text>
                            </View>
                        </View>
                    </View>

                ))}

            </ScrollView>

            {/* Atualizar Cotações / BUTTON */}
            <TouchableOpacity
                style={{ backgroundColor: '#4caf93', width: 340, height: 50, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowColor: '#f4a261' }}
                onPress={atualizaCotacoes}
                disabled={loading}
                activeOpacity={0.9}
            >
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 19 }}>Atualizar Cotações</Text>
                    {loading ? (
                        <View style={{ position: 'absolute', right: 18, top: 0, bottom: 0, justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    ) : null}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={{ backgroundColor: '#af2d2d', width: 340, height: 50, borderRadius: 30, marginTop: 15, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowColor: '#f4a261' }}
                onPress={fazerLogout}
                disabled={loading}
                activeOpacity={0.9}
            >
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 19 }}>Fazer Logout</Text>
                    {loading ? (
                        <View style={{ position: 'absolute', right: 18, top: 0, bottom: 0, justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    ) : null}
                </View>
            </TouchableOpacity>

        </View>
    )
};
export default initialScreen;