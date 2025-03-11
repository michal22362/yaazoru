import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/system';
import { CreditDetails, Customer, ItemForMonthlyPayment, MonthlyPayment, MonthlyPaymentManagement, PaymentCreditLink } from '../../model/src';
import CustomTypography from '../designComponent/Typography';
import { colors } from '../../styles/theme';
import { getCustomerById } from '../../api/customerApi';
import CustomTabs from '../designComponent/Tab';
import CustomerSelector from '../customers/CustomerSelector';
import FormToAddItems from './FormToAddItems';
import { CustomButton } from '../designComponent/Button';
import { getItemsByMonthlyPaymentId } from '../../api/itemsApi';
import { useNavigate, useParams } from 'react-router-dom';
import { getMonthlyPaymentById } from '../../api/monhlyPaymentApi';
import PaymentForm from './PaymentForm';
import { updateMonthlyPayment } from '../../api/monthlyPaymentManagement';
import { getCreditDetailsById } from '../../api/creditDetails';
import { getPaymentCreditLinkByMonthlyPaymentId } from '../../api/paymentCreditLink';

const EditMonthlyPayment: React.FC = () => {
    const { id } = useParams(); // קבלת ה-id מה-URL
    const navigate = useNavigate(); // לנווט במקרה של שגיאה
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width:600px)');
    const [customer, setCustomer] = useState<Customer.Model>();
    const [monthlyPayment, setMonthlyPayment] = useState<MonthlyPayment.Model>();
    const [items, setItems] = useState<ItemForMonthlyPayment.Model[]>([]);
    const [timeData, setTimeData] = useState<{ startDate: Date, payments: number, mustEvery: string, dayOfTheMonth: string }>({
        startDate: new Date(Date.now()),
        payments: 400000,
        mustEvery: monthlyPayment?.frequency || '',
        dayOfTheMonth: monthlyPayment?.dayOfTheMonth || '',
    });
    const [paymentData, setPaymentData] = useState<any>(null);
    const [creditDetails, setCreditDetails] = useState<CreditDetails.Model>();
    const [error, setError] = useState<string | null>(null);
    const paymentFormRef = useRef<{ chargeCcData: () => void } | null>(null);


    const fetchMonthlyPaymentData = useCallback(async (id: string) => {
        try {
            const monthlyPaymentEdit: MonthlyPayment.Model = await getMonthlyPaymentById(id);
            if (!monthlyPaymentEdit) {
                throw new Error(t('errorPaymentNotFound'));
            }
            setMonthlyPayment(monthlyPaymentEdit);

            const customerData = await getCustomerById(monthlyPaymentEdit.customer_id);
            if (!customerData) {
                throw new Error(t('errorCustomerNotFound'));
            }

            const itemsData = await getItemsByMonthlyPaymentId(monthlyPaymentEdit.monthlyPayment_id);
            console.log('i after fetch monthly payment,customer and items');
            console.log(itemsData);

            const paymentCreditLink: PaymentCreditLink.Model = await getPaymentCreditLinkByMonthlyPaymentId(monthlyPaymentEdit.monthlyPayment_id);
            const creditData: CreditDetails.Model = await getCreditDetailsById(paymentCreditLink.creditDetails_id);

            setCustomer(customerData);
            setItems(itemsData);
            setCreditDetails(creditData);
        } catch (err) {
            setError((err as Error).message);
        }
    }, []);

    useEffect(() => {
        if (monthlyPayment) {
            setTimeData({
                ...timeData,
                mustEvery: monthlyPayment.frequency || '',  // עדכון mustEvery עם הערך של frequency
                dayOfTheMonth: monthlyPayment.dayOfTheMonth || ''
            });
        }
    }, [monthlyPayment]);

    useEffect(() => {
        if (!id) {
            setError(t('errorInvalidId'));
            return;
        }
        fetchMonthlyPaymentData(id);

    }, [id, fetchMonthlyPaymentData, t]);


    const charge = async () => {
        try {
            await paymentFormRef.current?.chargeCcData();
        } catch (error) {
            console.error('Error during payment:', error);
        }
    };

    const calculateEndDate = (startDate: Date, numberOfCharges: number, chargeIntervalMonths: number): Date => {
        let endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + chargeIntervalMonths * (numberOfCharges - 1));
        return endDate;
    };

    const update = async () => {
        if (!customer || !monthlyPayment || !creditDetails) {
            setError('Missing customer or monthly payment or credit details data');
            return;
        }

        if (!timeData.mustEvery) {
            setError('Missing payment frequency');
            return;
        }
        if (!monthlyPayment?.monthlyPayment_id) {
            setError("Invalid or missing monthlyPayment_id");
            return;
        }

        console.log('----------------------------------------------------------------');

        console.log('monthlyPayment, ', monthlyPayment);
        console.log('timeData, ', timeData);
        console.log('paymentData, ', paymentData);
        console.log('begibing update--------------------');
        console.log('timeData.startDate:', timeData?.startDate);
        console.log('timeData.frequancy:', timeData?.mustEvery);
        console.log('monthlyPayment.monthlyPayment_id:', monthlyPayment?.monthlyPayment_id);
        items.map(item => console.log(item));


        //await charge();
        const itemsBeforeChange: ItemForMonthlyPayment.Model[] = await getItemsByMonthlyPaymentId(monthlyPayment?.monthlyPayment_id || '');

        const updatedItems = items?.map((item, index) => {
            const previousItem = itemsBeforeChange.find(i => i.item_id === item.item_id);
            const isNewItem = !previousItem;
            const hasChanges = previousItem && (
                previousItem.description !== item.description ||
                previousItem.paymentType !== item.paymentType ||
                previousItem.price !== item.price ||
                previousItem.quantity !== item.quantity ||
                previousItem.total !== item.total
            );
            return {
                item_id: item.item_id,
                monthlyPayment_id: monthlyPayment?.monthlyPayment_id,
                description: item.description,
                paymentType: item.paymentType,
                price: item.price,
                quantity: item.quantity,
                total: item.total,
                created_at: isNewItem ? new Date(Date.now()) : previousItem.created_at,
                update_at: hasChanges || isNewItem ? new Date(Date.now()) : previousItem?.update_at,
            };
        });

        let amount = 0;
        let oneTimePayment = 0;
        items?.forEach(item => {
            if (item.paymentType === t('standingOrder'))
                amount += parseFloat(item.total.toString())
            if (item.paymentType === t('oneTimePayment'))
                oneTimePayment += parseFloat(item.total.toString())
        });

        const monthlyPaymentManagement: MonthlyPaymentManagement.Model = {
            customer_id: customer?.customer_id,
            monthlyPayment: {
                monthlyPayment_id: monthlyPayment?.monthlyPayment_id,
                customer_id: customer?.customer_id,
                belongsOrganization: 'יעזורו',
                start_date: monthlyPayment?.start_date,
                end_date: calculateEndDate(timeData.startDate, timeData?.payments, parseInt(timeData?.mustEvery)),
                amount: amount,
                total_amount: amount * monthlyPayment.amountOfCharges !== timeData?.payments ? timeData.payments : monthlyPayment.amountOfCharges,
                oneTimePayment: oneTimePayment,
                frequency: monthlyPayment.frequency !== timeData?.mustEvery ? timeData.mustEvery : monthlyPayment.frequency,
                amountOfCharges: monthlyPayment.amountOfCharges !== timeData?.payments ? timeData.payments : monthlyPayment.amountOfCharges,
                dayOfTheMonth: monthlyPayment.dayOfTheMonth !== timeData?.dayOfTheMonth ? timeData.dayOfTheMonth : monthlyPayment.dayOfTheMonth,
                next_charge: monthlyPayment.next_charge,
                last_attempt: monthlyPayment?.last_attempt,
                last_sucsse: monthlyPayment?.last_sucsse,
                created_at: monthlyPayment?.created_at,
                update_at: new Date(Date.now()),
                status: 'active',
            },
            creditDetails: {
                //פה יש עוד דברים שצריך לשנות
                credit_id: creditDetails.credit_id,
                customer_id: customer?.customer_id,
                token: creditDetails.token/*paymentData?.token*/,
                expiry_month: creditDetails.expiry_month /*paymentData?.expiry_month*/,
                expiry_year: creditDetails.expiry_year/*paymentData?.expiry_year*/,
                created_at: creditDetails.created_at,
                update_at: new Date(Date.now()),
            },
            paymentCreditLink: {
                paymentCreditLink_id: '',
                creditDetails_id: '',
                monthlyPayment_id: '',
                status: 'active',
            },
            payments: [],
            items: updatedItems,
        };
        try {
            const response = await updateMonthlyPayment(monthlyPaymentManagement, monthlyPayment?.monthlyPayment_id || '');
            if (response.status === 200) {
                navigate('/monthlyPayment')
            } else {
                setError('Error updating monthly payment');
            }

        } catch (error) {
            console.error('Error updating monthly payment:', error)
            setError('Error updating monthly payment');
        }
    };


    const cancel = () => {
        navigate('/monthlyPayment');
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CustomTypography text={error} variant="h2" weight="bold" color="red" />
                <CustomButton label={t('backToHome')} onClick={() => navigate('/')} />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{
                paddingLeft: '10%',
                paddingRight: '15%',
            }}>
                <Box sx={{
                    direction: 'rtl',
                    display: 'flex',
                    paddingTop: '5%',
                    paddingBottom: '3%'
                }}>
                    <CustomTypography
                        text={`${t('editingStandingOrder')} |`}
                        variant='h1'
                        weight='regular'
                        color={colors.brand.color_9}
                    />
                    <CustomTypography
                        text={` ${customer?.first_name} ${customer?.last_name}`}
                        variant='h1'
                        weight='bold'
                        color={colors.brand.color_9}
                    />
                </Box>
                <CustomTabs
                    tabs={
                        [
                            {
                                label: t('customerDetails'), content:
                                    <Box sx={{
                                        width: '100%',
                                    }}>
                                        <Box sx={{ marginBottom: 2 }}>
                                            <CustomerSelector onCustomerSelect={setCustomer} initialCustomer={customer} />
                                        </Box>
                                        <Box sx={{ marginBottom: 2 }}>
                                            <FormToAddItems onItemsChange={setItems} initialItems={items} />
                                        </Box>
                                    </Box>
                            },
                            {
                                label: t('paymentDetails'), content:
                                    <Box >
                                        <PaymentForm ref={paymentFormRef} onPaymentChange={setPaymentData} OnTimeChange={setTimeData} defaultValues={{
                                            name: '',//customer?.first_name + ' ' + customer?.last_name,
                                            mustEvery: monthlyPayment?.frequency || '',  // פרטי תדירות החיוב
                                            Payments: String(monthlyPayment?.amountOfCharges || 0),  // מספר התשלומים
                                            startDate: monthlyPayment?.start_date || new Date(Date.now()),
                                            dayOfTheMonth: String(monthlyPayment?.dayOfTheMonth || 1)  // יום החודש
                                        }} />
                                    </Box>
                            },
                            {
                                label: t('recentPayments'), content: <Box>

                                </Box>
                            },
                        ]
                    }
                />
                <Box sx={{
                    direction: 'rtl',
                    width: '100%',
                    marginBottom: 2,
                    display: 'flex',
                }}>
                    <CustomButton
                        label={t('cancellation')}
                        size={isMobile ? 'small' : 'large'}
                        state='default'
                        buttonType='third'
                        onClick={cancel}
                        sx={{
                            marginLeft: 2
                        }}
                    />
                    <CustomButton
                        label={t('saving')}
                        size={isMobile ? 'small' : 'large'}
                        state='default'
                        buttonType='first'
                        onClick={update}
                    />
                </Box>
            </Box>
        </>

    );
};
export default EditMonthlyPayment;
