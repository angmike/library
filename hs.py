class A:
    def str(self):
        return '1'


class B(A):
    def init(self):
        super().init()


obj1 = A()
obj2 = B()

print(obj1, obj2)
